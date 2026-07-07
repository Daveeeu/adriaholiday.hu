<?php

namespace Tests\Unit;

use App\Services\Legacy\LegacyMediaImporter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Tests\TestCase;

class LegacyMediaImporterTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Minimal valid 1x1 transparent PNG, so Spatie's synchronous image
     * conversions (thumbnail/preview on AdminMediaItem) succeed for real.
     */
    private const ONE_PIXEL_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake(config('media-library.disk_name'));
    }

    public function test_it_downloads_and_stores_a_new_image(): void
    {
        Http::fake([
            '*' => Http::response(base64_decode(self::ONE_PIXEL_PNG_BASE64), 200, ['Content-Type' => 'image/png']),
        ]);

        $importer = new LegacyMediaImporter;

        $media = $importer->importImage('https://adriaholiday.hu/uploads/gallery/1/photo.jpg', [
            'alt' => 'Teszt alt',
            'title' => 'Teszt cím',
        ]);

        $this->assertInstanceOf(Media::class, $media);
        $this->assertSame('legacy-import', $media->source_context);
        $this->assertSame('Teszt alt', $media->alt);
        $this->assertSame('https://adriaholiday.hu/uploads/gallery/1/photo.jpg', $media->custom_properties['legacy_url']);
        $this->assertSame(1, $importer->downloadCount());
        $this->assertSame(1, Media::query()->count());
    }

    public function test_it_reuses_existing_media_for_the_same_url_instead_of_downloading_again(): void
    {
        Http::fake([
            '*' => Http::response(base64_decode(self::ONE_PIXEL_PNG_BASE64), 200, ['Content-Type' => 'image/png']),
        ]);

        $importer = new LegacyMediaImporter;
        $url = 'https://adriaholiday.hu/uploads/gallery/1/photo.jpg';

        $first = $importer->importImage($url, ['alt' => 'Első']);
        $second = $importer->importImage($url, ['alt' => 'Második']);

        $this->assertSame($first->id, $second->id);
        $this->assertSame(1, Media::query()->count());
        $this->assertSame(1, $importer->downloadCount());
        Http::assertSentCount(1);
    }

    public function test_it_downloads_separately_for_different_urls(): void
    {
        Http::fake([
            '*' => Http::response(base64_decode(self::ONE_PIXEL_PNG_BASE64), 200, ['Content-Type' => 'image/png']),
        ]);

        $importer = new LegacyMediaImporter;

        $first = $importer->importImage('https://adriaholiday.hu/uploads/gallery/1/photo-a.jpg');
        $second = $importer->importImage('https://adriaholiday.hu/uploads/gallery/1/photo-b.jpg');

        $this->assertNotSame($first->id, $second->id);
        $this->assertSame(2, Media::query()->count());
        $this->assertSame(2, $importer->downloadCount());
    }
}
