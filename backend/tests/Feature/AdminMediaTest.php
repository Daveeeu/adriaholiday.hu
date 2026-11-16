<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Media\WebImageOptimizer;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Tests\TestCase;

class AdminMediaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
        Storage::fake(config('media-library.disk_name'));
    }

    public function test_admin_media_upload_list_show_and_delete_work(): void
    {
        $this->actingAsAdmin();

        $uploadResponse = $this->postJson('/api/admin/media', [
            'file' => UploadedFile::fake()->image('test-image.jpg', 1200, 800),
            'category' => 'blog',
            'sourceContext' => 'blog_article',
            'sourceId' => 12,
            'alt' => 'Blog alt szöveg',
            'title' => 'Blog cím',
        ]);

        $uploadResponse->assertOk();
        $uploadResponse->assertJsonStructure([
            'id',
            'url',
            'thumbnailUrl',
            'name',
            'fileName',
            'size',
            'type',
            'extension',
            'category',
            'categoryLabel',
            'sourceContext',
            'sourceId',
            'alt',
            'title',
            'createdAt',
        ]);
        $uploadResponse->assertJsonPath('category', 'blog');
        $uploadResponse->assertJsonPath('categoryLabel', 'Blog');
        $uploadResponse->assertJsonPath('type', 'image');
        $uploadResponse->assertJsonPath('extension', 'webp');
        $uploadResponse->assertJsonPath('sourceContext', 'blog_article');
        $uploadResponse->assertJsonPath('sourceId', 12);
        $uploadResponse->assertJsonPath('alt', 'Blog alt szöveg');
        $uploadResponse->assertJsonPath('title', 'Blog cím');

        $mediaId = $uploadResponse->json('id');

        $listResponse = $this->getJson('/api/admin/media?category=blog&sourceContext=blog_article&search=Blog alt szöveg&sort=name');
        $listResponse->assertOk();
        $listResponse->assertJsonCount(1, 'items');
        $listResponse->assertJsonPath('items.0.category', 'blog');

        $showResponse = $this->getJson("/api/admin/media/{$mediaId}");
        $showResponse->assertOk();
        $showResponse->assertJsonPath('id', $mediaId);
        $showResponse->assertJsonPath('category', 'blog');
        $showResponse->assertJsonPath('usage.0.label', 'Blog #12');

        $updateResponse = $this->patchJson("/api/admin/media/{$mediaId}", [
            'category' => 'portfolio',
            'alt' => 'Frissített alt',
            'title' => 'Frissített cím',
        ]);

        $updateResponse->assertOk();
        $updateResponse->assertJsonPath('category', 'portfolio');
        $updateResponse->assertJsonPath('categoryLabel', 'Portfólió');
        $updateResponse->assertJsonPath('alt', 'Frissített alt');
        $updateResponse->assertJsonPath('title', 'Frissített cím');

        $deleteResponse = $this->deleteJson("/api/admin/media/{$mediaId}");
        $deleteResponse->assertNoContent();
    }

    public function test_admin_media_pdf_upload_supports_documents_and_type_metadata(): void
    {
        $this->actingAsAdmin();

        $uploadResponse = $this->postJson('/api/admin/media', [
            'file' => UploadedFile::fake()->create('program.pdf', 512, 'application/pdf'),
            'category' => 'tours',
            'sourceContext' => 'tour_program_pdf',
            'sourceId' => 44,
            'alt' => 'Program PDF alt',
            'title' => 'Program PDF cím',
        ]);

        $uploadResponse->assertOk();
        $uploadResponse->assertJsonPath('type', 'pdf');
        $uploadResponse->assertJsonPath('extension', 'pdf');
        $uploadResponse->assertJsonPath('category', 'tours');
        $uploadResponse->assertJsonPath('categoryLabel', 'Utazások');
        $uploadResponse->assertJsonPath('sourceContext', 'tour_program_pdf');
        $uploadResponse->assertJsonPath('usage.0.label', 'Tour program PDF #44');

        $mediaId = $uploadResponse->json('id');

        $listResponse = $this->getJson('/api/admin/media?category=tours&search=program.pdf');
        $listResponse->assertOk();
        $listResponse->assertJsonCount(1, 'items');
        $listResponse->assertJsonPath('items.0.type', 'pdf');

        $showResponse = $this->getJson("/api/admin/media/{$mediaId}");
        $showResponse->assertOk();
        $showResponse->assertJsonPath('type', 'pdf');
        $showResponse->assertJsonPath('extension', 'pdf');
    }

    public function test_an_uploaded_photo_is_stored_as_a_web_sized_webp(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/admin/media', [
            'file' => UploadedFile::fake()->image('Gdansk part.jpg', 4000, 3000),
        ])->assertOk();

        $response->assertJsonPath('name', 'Gdansk part');
        $response->assertJsonPath('fileName', 'Gdansk-part.webp');
        $response->assertJsonPath('mimeType', 'image/webp');

        $media = Media::query()->findOrFail($response->json('id'));
        [$width, $height] = getimagesize($media->getPath());

        $this->assertSame([WebImageOptimizer::MAX_SIDE, 1920], [$width, $height]);
        $this->assertSame('image/webp', mime_content_type($media->getPath()));
    }

    public function test_a_small_screenshot_keeps_its_size_but_becomes_webp(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/admin/media', [
            'file' => UploadedFile::fake()->image('kepernyokep.png', 800, 600),
        ])->assertOk();

        $media = Media::query()->findOrFail($response->json('id'));

        $this->assertSame([800, 600], array_slice(getimagesize($media->getPath()), 0, 2));
        $response->assertJsonPath('fileName', 'kepernyokep.webp');
    }

    public function test_a_gif_is_stored_as_it_is(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/admin/media', [
            'file' => UploadedFile::fake()->image('animacio.gif', 300, 200),
        ])
            ->assertOk()
            ->assertJsonPath('fileName', 'animacio.gif')
            ->assertJsonPath('mimeType', 'image/gif');
    }

    public function test_an_oversized_photo_or_document_is_rejected_with_a_validation_error(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/admin/media', [
            'file' => UploadedFile::fake()->image('panorama.jpg', WebImageOptimizer::MAX_UPLOAD_DIMENSION + 1, 100),
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');

        // A document is stored as it is, so it must fit the media library's own limit.
        $this->postJson('/api/admin/media', [
            'file' => UploadedFile::fake()->create('katalogus.pdf', 11 * 1024, 'application/pdf'),
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');
    }

    public function test_the_photo_rights_embedded_in_a_jpeg_survive_the_conversion(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/admin/media', [
            'file' => $this->jpegWithIptc([
                '2#080' => 'Kovács Péter',
                '2#116' => '© 2026 Kovács Péter',
                '2#115' => 'Shutterstock',
            ]),
        ])->assertOk();

        $response->assertJsonPath('fileName', 'malbork.webp');
        $response->assertJsonPath('author', 'Kovács Péter');
        $response->assertJsonPath('copyright', '© 2026 Kovács Péter');
        $response->assertJsonPath('origin', 'Shutterstock');
        $response->assertJsonPath('license', null);
    }

    public function test_rights_typed_in_the_admin_win_and_can_be_edited_later(): void
    {
        $this->actingAsAdmin();

        $mediaId = $this->postJson('/api/admin/media', [
            'file' => $this->jpegWithIptc(['2#080' => 'Beágyazott szerző']),
            'author' => 'Adria Holiday',
            'license' => 'Saját fotó, korlátlan felhasználás',
        ])
            ->assertOk()
            ->assertJsonPath('author', 'Adria Holiday')
            ->assertJsonPath('license', 'Saját fotó, korlátlan felhasználás')
            ->json('id');

        $this->patchJson("/api/admin/media/{$mediaId}", [
            'origin' => 'Partner: Hotel Gdansk',
            'license' => '',
        ])
            ->assertOk()
            ->assertJsonPath('author', 'Adria Holiday')
            ->assertJsonPath('origin', 'Partner: Hotel Gdansk')
            ->assertJsonPath('license', null);
    }

    public function test_a_broken_photo_is_rejected_with_a_validation_error(): void
    {
        $this->actingAsAdmin();
        $photo = UploadedFile::fake()->image('serult.jpg', 600, 400);
        // Only the JPEG header survives: it still reads as a JPEG, but cannot be decoded.
        file_put_contents($photo->getPathname(), substr((string) file_get_contents($photo->getPathname()), 0, 200));

        $this->postJson('/api/admin/media', ['file' => $photo])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');
    }

    /**
     * @param  array<string, string>  $datasets  IPTC dataset => value
     */
    private function jpegWithIptc(array $datasets): UploadedFile
    {
        $photo = UploadedFile::fake()->image('malbork.jpg', 600, 400);
        $block = '';

        foreach ($datasets as $dataset => $value) {
            [$record, $tag] = array_map('intval', explode('#', $dataset));
            $block .= chr(0x1C).chr($record).chr($tag).pack('n', strlen($value)).$value;
        }

        file_put_contents($photo->getPathname(), iptcembed($block, $photo->getPathname()));

        return $photo;
    }

    private function actingAsAdmin(): void
    {
        $user = User::query()->where('email', 'info@jandldavid.hu')->firstOrFail();

        Sanctum::actingAs($user);
    }
}
