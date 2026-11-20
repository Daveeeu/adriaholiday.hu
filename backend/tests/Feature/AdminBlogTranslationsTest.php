<?php

namespace Tests\Feature;

use App\Models\BlogArticle;
use App\Models\BlogArticleTranslation;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminBlogTranslationsTest extends TestCase
{
    use RefreshDatabase;

    private const EMPTY_ARTICLE_TRANSLATION = ['title' => '', 'seo_name' => '', 'seo_auto_generate' => true, 'excerpt' => '', 'content' => ''];

    protected function setUp(): void
    {
        parent::setUp();

        foreach (['blog-articles', 'blog-categories', 'blog-tags'] as $module) {
            foreach (['viewAny', 'view', 'create', 'update', 'delete'] as $ability) {
                Permission::findOrCreate("{$module}.{$ability}", 'web');
            }
        }

        $role = Role::findOrCreate('Blog Translations Test Admin', 'web');
        $role->syncPermissions(Permission::all());
        $user = User::factory()->create();
        $user->assignRole($role);

        Sanctum::actingAs($user);
    }

    public function test_a_legacy_post_with_only_hungarian_text_saves_without_other_languages(): void
    {
        $article = BlogArticle::factory()->create();
        BlogArticleTranslation::factory()->for($article, 'blogArticle')->create(['locale' => 'hu', 'title' => '5 TIPP - MIÉRT Horvátország?', 'seo_name' => '5-tipp-miert-horvatorszag']);

        $this->putJson("/api/admin/blog/articles/{$article->id}", $this->articlePayload([
            'en' => self::EMPTY_ARTICLE_TRANSLATION,
            'de' => self::EMPTY_ARTICLE_TRANSLATION,
        ]))->assertOk();

        $this->assertSame(['hu'], $article->translations()->pluck('locale')->all());
        $this->assertStringContainsString('/regiok/croatia', (string) $article->translations()->where('locale', 'hu')->value('content'));
    }

    public function test_clearing_a_language_removes_its_translation(): void
    {
        $articleId = $this->postJson('/api/admin/blog/articles', $this->articlePayload([
            'en' => ['title' => 'Five tips', 'seo_name' => 'five-tips', 'seo_auto_generate' => false, 'excerpt' => '', 'content' => '<p>Text</p>'],
            'de' => self::EMPTY_ARTICLE_TRANSLATION,
        ]))->assertCreated()->json('data.id');

        $this->assertSame(['en', 'hu'], BlogArticleTranslation::query()->where('blog_article_id', $articleId)->orderBy('locale')->pluck('locale')->all());

        $this->putJson("/api/admin/blog/articles/{$articleId}", $this->articlePayload([
            'en' => self::EMPTY_ARTICLE_TRANSLATION,
            'de' => self::EMPTY_ARTICLE_TRANSLATION,
        ]))->assertOk();

        $this->assertSame(['hu'], BlogArticleTranslation::query()->where('blog_article_id', $articleId)->pluck('locale')->all());
    }

    public function test_a_language_with_text_needs_its_title(): void
    {
        $this->postJson('/api/admin/blog/articles', $this->articlePayload([
            'en' => self::EMPTY_ARTICLE_TRANSLATION,
            'de' => ['title' => '', 'seo_name' => '', 'seo_auto_generate' => true, 'excerpt' => '', 'content' => '<p>Nur Text</p>'],
        ]))->assertUnprocessable()->assertJsonValidationErrors(['translations.de.title']);

        $this->postJson('/api/admin/blog/articles', $this->articlePayload([
            'en' => self::EMPTY_ARTICLE_TRANSLATION,
            'de' => self::EMPTY_ARTICLE_TRANSLATION,
            'hu' => self::EMPTY_ARTICLE_TRANSLATION,
        ]))->assertUnprocessable()->assertJsonValidationErrors(['translations.hu.title', 'translations.hu.content']);
    }

    public function test_an_untouched_editor_leaves_a_language_unwritten(): void
    {
        $articleId = $this->postJson('/api/admin/blog/articles', $this->articlePayload([
            'en' => ['title' => '', 'seo_name' => '', 'seo_auto_generate' => true, 'excerpt' => '<p></p>', 'content' => '<p><br></p>'],
            'de' => self::EMPTY_ARTICLE_TRANSLATION,
        ]))->assertCreated()->json('data.id');

        $this->assertSame(['hu'], BlogArticleTranslation::query()->where('blog_article_id', $articleId)->pluck('locale')->all());
    }

    public function test_categories_and_tags_save_with_their_hungarian_name_only(): void
    {
        $categoryId = $this->postJson('/api/admin/blog/categories', [
            'active' => true,
            'column' => '1',
            'translations' => [
                'hu' => ['name' => 'Célpontban', 'seo_name' => 'celpontban', 'seo_auto_generate' => false],
                'en' => ['name' => '', 'seo_name' => '', 'seo_auto_generate' => true],
                'de' => ['name' => '', 'seo_name' => '', 'seo_auto_generate' => true],
            ],
        ])->assertCreated()->json('data.id');
        $tagId = $this->postJson('/api/admin/blog/tags', [
            'active' => true,
            'translations' => ['hu' => ['name' => 'Advent'], 'en' => ['name' => ''], 'de' => ['name' => '']],
        ])->assertCreated()->json('data.id');

        $this->assertSame(['hu'], BlogCategory::query()->findOrFail($categoryId)->translations()->pluck('locale')->all());
        $this->assertSame(['hu'], BlogTag::query()->findOrFail($tagId)->translations()->pluck('locale')->all());
    }

    /**
     * @param  array<string, array<string, mixed>>  $translations  per-locale overrides
     * @return array<string, mixed>
     */
    private function articlePayload(array $translations): array
    {
        return [
            'active' => true,
            'published_at' => now()->toDateTimeString(),
            'image_title' => '5 tipp Horvátországhoz',
            'category_ids' => [BlogCategory::factory()->create()->id],
            'tag_ids' => [],
            'translations' => [
                'hu' => [
                    'title' => '5 TIPP - MIÉRT Horvátország?',
                    'seo_name' => '5-tipp-miert-horvatorszag',
                    'seo_auto_generate' => false,
                    'excerpt' => '',
                    'content' => '<p>Az Adriai-tenger és a hegyek találkozása.</p><p><a href="/regiok/croatia">Horvátországi utazásaink</a></p>',
                ],
                ...$translations,
            ],
        ];
    }
}
