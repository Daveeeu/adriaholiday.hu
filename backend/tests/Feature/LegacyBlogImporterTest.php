<?php

namespace Tests\Feature;

use App\Models\BlogArticle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class LegacyBlogImporterTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.legacy_adria.request_delay_ms' => 0, 'seo.site_url' => 'https://adriaholiday.hu']);
        $image = UploadedFile::fake()->image('photo.jpg', 40, 30)->getContent();
        Http::fake(['adriaholiday.hu/files/*' => Http::response($image, 200, ['Content-Type' => 'image/jpeg'])]);
    }

    /**
     * @return array<string, mixed>
     */
    private function legacyPost(array $overrides = []): array
    {
        return array_merge([
            'id' => 49,
            'status' => '1',
            'accentuated' => '0',
            'author' => '',
            'date' => '2019-07-02 13:20',
            'image' => 'files/croatia.jpg',
            'imageTitle' => '',
            'title' => '5 TIPP - MIÉRT Horvátország?',
            'seoName' => '5-tipp-miert-horvatorszag',
            'short' => '',
            'long' => '<p>Gyönyörű ország.</p><p><img src="files/beach.jpg" alt=""></p>'
                .'<p><a href="https://adriaholiday.hu/korutazasok/horvat-csodak">Horvát csodák</a> és <a href="korutazasok/csoport/korutazas/horvatorszag">körutak</a></p>',
        ], $overrides);
    }

    private function runImport(array $posts): void
    {
        $path = tempnam(sys_get_temp_dir(), 'legacy-blog');
        file_put_contents($path, json_encode($posts));
        $this->artisan('adria:import-legacy-blog', ['path' => $path])->assertSuccessful();
        unlink($path);
    }

    public function test_posts_are_imported_once_with_local_images_and_site_relative_links(): void
    {
        $this->runImport([$this->legacyPost()]);
        $this->runImport([$this->legacyPost()]);

        $article = BlogArticle::query()->with('translations')->sole();
        $translation = $article->translations->firstWhere('locale', 'hu');

        $this->assertTrue($article->active);
        $this->assertSame('2019-07-02', $article->published_at->toDateString());
        $this->assertStringStartsWith('/storage/', $article->image);
        $this->assertSame('5-tipp-miert-horvatorszag', $translation->seo_name);
        $this->assertSame('Gyönyörű ország. Horvát csodák és körutak', $translation->excerpt);
        $this->assertStringNotContainsString('files/beach.jpg', $translation->content);
        $this->assertMatchesRegularExpression('~<img[^>]+src="/storage/[^"]+"~', $translation->content);
        $this->assertStringContainsString('href="/korutazasok/horvat-csodak"', $translation->content);
        $this->assertStringContainsString('href="/korutazasok/csoport/korutazas/horvatorszag"', $translation->content);
    }

    public function test_a_post_imported_earlier_keeps_its_url_and_gets_the_legacy_date(): void
    {
        $existing = BlogArticle::query()->create(['active' => true, 'published_at' => '2026-01-25', 'image_title' => 'Horvátország 10 legszebb strandja']);
        $existing->translations()->create(['locale' => 'hu', 'title' => 'Horvátország 10 legszebb strandja', 'seo_name' => 'horvatorszag-10-legszebb-strandja', 'content' => '<p>régi</p>']);

        $this->runImport([$this->legacyPost(['title' => 'Horvátország 10 legszebb strandja', 'seoName' => 'teszt-2', 'date' => '2018-01-25 12:46'])]);

        $article = BlogArticle::query()->with('translations')->sole();
        $this->assertSame('2018-01-25', $article->published_at->toDateString());
        $this->assertSame('horvatorszag-10-legszebb-strandja', $article->translations->firstWhere('locale', 'hu')->seo_name);
    }

    public function test_legacy_post_urls_with_the_post_id_redirect(): void
    {
        $this->runImport([$this->legacyPost()]);

        $this->get('https://adriaholiday.hu/blog/5-tipp-miert-horvatorszag-49')
            ->assertStatus(301)
            ->assertRedirect('/blog/5-tipp-miert-horvatorszag');
        $this->get('https://adriaholiday.hu/blog/5-tipp-miert-horvatorszag')->assertOk();
    }
}
