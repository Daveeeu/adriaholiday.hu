<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminBlogArticlesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    public function test_blog_article_store_and_update_persist_portfolio_fields(): void
    {
        $this->actingAsAdmin();

        $categoryId = BlogCategory::query()->orderBy('id')->value('id');

        $createResponse = $this->postJson('/api/admin/blog/articles', $this->payload([
            'portfolio_featured' => true,
            'portfolio_sort_order' => 7,
            'category_ids' => [$categoryId],
        ]));

        $createResponse->assertCreated();
        $createResponse->assertJsonPath('data.portfolioFeatured', true);
        $createResponse->assertJsonPath('data.portfolioSortOrder', 7);

        $articleId = $createResponse->json('data.id');

        $this->assertDatabaseHas('blog_articles', [
            'id' => $articleId,
            'portfolio_featured' => true,
            'portfolio_sort_order' => 7,
        ]);

        $updateResponse = $this->patchJson("/api/admin/blog/articles/{$articleId}", $this->payload([
            'portfolio_featured' => false,
            'portfolio_sort_order' => 3,
            'category_ids' => [$categoryId],
        ]));

        $updateResponse->assertOk();
        $updateResponse->assertJsonPath('data.portfolioFeatured', false);
        $updateResponse->assertJsonPath('data.portfolioSortOrder', 3);

        $this->assertDatabaseHas('blog_articles', [
            'id' => $articleId,
            'portfolio_featured' => false,
            'portfolio_sort_order' => 3,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'active' => true,
            'published_at' => now()->toDateTimeString(),
            'show_on_homepage' => false,
            'portfolio_featured' => false,
            'portfolio_sort_order' => 0,
            'image_title' => 'Teszt blogcikk',
            'sort_order' => 999,
            'category_ids' => [],
            'tag_ids' => [],
            'translations' => [
                'hu' => [
                    'title' => 'Teszt blogcikk',
                    'seo_name' => 'teszt-blogcikk',
                    'seo_auto_generate' => false,
                    'excerpt' => 'Teszt kivonat',
                    'content' => 'Teszt tartalom',
                ],
                'en' => [
                    'title' => 'Test blog article',
                    'seo_name' => 'test-blog-article',
                    'seo_auto_generate' => false,
                    'excerpt' => 'Test excerpt',
                    'content' => 'Test content',
                ],
                'de' => [
                    'title' => 'Test Blogartikel',
                    'seo_name' => 'test-blogartikel',
                    'seo_auto_generate' => false,
                    'excerpt' => 'Test Auszug',
                    'content' => 'Test Inhalt',
                ],
            ],
        ], $overrides);
    }

    private function actingAsAdmin(): void
    {
        $user = User::query()->where('email', 'info@jandldavid.hu')->firstOrFail();

        Sanctum::actingAs($user);
    }
}
