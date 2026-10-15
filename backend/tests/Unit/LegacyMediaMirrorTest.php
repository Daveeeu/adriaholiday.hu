<?php

namespace Tests\Unit;

use App\Models\AdminMediaItem;
use App\Models\LegacyMediaFile;
use App\Services\Legacy\LegacyMediaMirror;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Tests\Concerns\FakesLegacyImages;
use Tests\TestCase;

class LegacyMediaMirrorTest extends TestCase
{
    use FakesLegacyImages, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.legacy_adria.request_delay_ms' => 0]);
    }

    public function test_the_same_file_under_two_urls_is_stored_once(): void
    {
        $png = self::pngFor('same');
        Http::fake(['*' => Http::response($png, 200, ['Content-Type' => 'image/png'])]);
        $mirror = new LegacyMediaMirror;

        $first = $mirror->mirror('https://adriaholiday.hu/uploads/gallery/1/a.jpg');
        $second = $mirror->mirror('https://adriaholiday.hu/uploads/gallery/2/a.jpg');

        $this->assertSame($first->media_id, $second->media_id);
        $this->assertSame(hash('sha256', $png), $second->content_sha256);
        $this->assertSame(1, Media::query()->count());
        $this->assertSame(2, LegacyMediaFile::query()->count());
    }

    public function test_an_image_imported_earlier_is_linked_without_downloading_it(): void
    {
        Http::fake();
        $url = 'https://adriaholiday.hu/uploads/gallery/1/a.jpg';
        $media = AdminMediaItem::create()->addMediaFromString(self::pngFor($url))->usingFileName('a.jpg')->toMediaCollection('library');
        $media->forceFill(['source_context' => LegacyMediaMirror::SOURCE_CONTEXT, 'custom_properties' => ['legacy_url' => $url]])->save();

        $file = (new LegacyMediaMirror)->mirror($url);

        $this->assertSame(LegacyMediaFile::MIRRORED, $file->status);
        $this->assertSame($media->id, $file->media_id);
        Http::assertNothingSent();
    }

    public function test_a_failed_download_is_recorded_and_retried_next_time(): void
    {
        Http::fake(['*' => Http::sequence()->push('', 503)->push('', 503)->push('', 503)->push(self::pngFor('x'), 200)]);
        $mirror = new LegacyMediaMirror;
        $url = 'https://adriaholiday.hu/uploads/gallery/1/a.jpg';

        $failed = $mirror->mirror($url);
        $this->assertSame(LegacyMediaFile::FAILED, $failed->status);
        $this->assertSame(503, $failed->http_status);
        $this->assertNull($mirror->localUrl($url));

        $mirrored = $mirror->mirror($url);
        $this->assertSame(LegacyMediaFile::MIRRORED, $mirrored->status);
        $this->assertSame(2, $mirrored->attempts);
        $this->assertStringStartsWith('/storage/', (string) $mirror->localUrl($url));
    }

    public function test_a_file_that_is_neither_an_image_nor_a_pdf_is_refused(): void
    {
        Http::fake(['*' => Http::response('<html>login</html>', 200, ['Content-Type' => 'text/html'])]);

        $file = (new LegacyMediaMirror)->mirror('https://adriaholiday.hu/uploads/gallery/1/a.jpg');

        $this->assertSame(LegacyMediaFile::FAILED, $file->status);
        $this->assertStringContainsString('not an image or PDF', (string) $file->error);
        $this->assertSame(0, Media::query()->count());
    }

    public function test_the_check_accepts_a_file_served_without_a_type_and_refuses_another_type(): void
    {
        Http::fake([
            '*/photo.jpg!d' => Http::response('', 200),
            '*/page.html' => Http::response('', 200, ['Content-Type' => 'text/html; charset=UTF-8']),
            '*/missing.jpg' => Http::response('', 404),
        ]);
        $mirror = new LegacyMediaMirror;

        $this->assertTrue($mirror->check('https://adriaholiday.hu/files/photo.jpg!d')['ok']);
        $this->assertSame('Unexpected content type "text/html"', $mirror->check('https://adriaholiday.hu/files/page.html')['error']);
        $this->assertSame(404, $mirror->check('https://adriaholiday.hu/files/missing.jpg')['http_status']);
    }

    public function test_a_file_with_an_odd_legacy_name_is_stored_by_its_content(): void
    {
        Http::fake(['*' => Http::response(self::pngFor('odd'), 200)]);

        $file = (new LegacyMediaMirror)->mirror('https://adriaholiday.hu/files/view-873682%20%281%29.jpg%21d');

        $this->assertSame(LegacyMediaFile::MIRRORED, $file->status);
        $this->assertSame('image/png', $file->media->mime_type);
    }

    public function test_a_photo_above_the_upload_limit_is_scaled_down_instead_of_lost(): void
    {
        $image = imagecreatetruecolor(4000, 120);
        for ($x = 0; $x < 4000; $x++) {
            imagesetpixel($image, $x, $x % 120, imagecolorallocate($image, $x % 256, ($x * 7) % 256, ($x * 13) % 256));
        }
        ob_start();
        imagejpeg($image, null, 100);
        $jpeg = (string) ob_get_clean();
        config(['media-library.max_file_size' => (int) (strlen($jpeg) * 0.8)]);
        Http::fake(['*' => Http::response($jpeg, 200, ['Content-Type' => 'image/jpeg'])]);

        $file = (new LegacyMediaMirror)->mirror('https://adriaholiday.hu/uploads/gallery/1/huge.jpg');

        $this->assertSame(LegacyMediaFile::MIRRORED, $file->status);
        $this->assertSame(hash('sha256', $jpeg), $file->content_sha256);
        $this->assertLessThan(strlen($jpeg), $file->media->size);
    }

    public function test_a_file_the_library_refuses_is_recorded_and_the_next_one_still_copied(): void
    {
        config(['media-library.max_file_size' => 100]);
        Http::fake([
            '*/big.pdf' => Http::response('%PDF-1.4 '.str_repeat('x', 500), 200, ['Content-Type' => 'application/pdf']),
            '*' => Http::response(self::pngFor('small'), 200, ['Content-Type' => 'image/png']),
        ]);
        $mirror = new LegacyMediaMirror;

        $failed = $mirror->mirror('https://adriaholiday.hu/files/big.pdf');
        $next = $mirror->mirror('https://adriaholiday.hu/files/small.png');

        $this->assertSame(LegacyMediaFile::FAILED, $failed->status);
        $this->assertStringContainsString('greater than the maximum allowed', (string) $failed->error);
        $this->assertSame(LegacyMediaFile::MIRRORED, $next->status);
    }
}
