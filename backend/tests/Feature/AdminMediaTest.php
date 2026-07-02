<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
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
        $uploadResponse->assertJsonPath('extension', 'jpg');
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

    private function actingAsAdmin(): void
    {
        $user = User::query()->where('email', 'info@jandldavid.hu')->firstOrFail();

        Sanctum::actingAs($user);
    }
}
