<?php

namespace Tests\Feature;

use App\Models\Tour;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SitemapTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('app.url', 'https://adriaholiday.hu');
        $this->seed(DatabaseSeeder::class);
    }

    public function test_sitemap_contains_active_offer(): void
    {
        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertHeader('Content-Type', 'application/xml; charset=UTF-8');
        $response->assertSee('https://adriaholiday.hu/ajanlat/albania-makedoniaval-fuszerezve', false);
    }

    public function test_sitemap_excludes_inactive_offer(): void
    {
        Tour::query()
            ->where('seo_name', 'albania-makedoniaval-fuszerezve')
            ->update(['active' => false]);

        $response = $this->get('/sitemap.xml');

        $response->assertOk();
        $response->assertDontSee('https://adriaholiday.hu/ajanlat/albania-makedoniaval-fuszerezve', false);
    }
}
