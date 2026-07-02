<?php

namespace Tests\Feature;

use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortfolioBlogTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_portfolio_blog_returns_featured_articles_in_portfolio_order(): void
    {
        $response = $this->getJson('/api/portfolio/blog?limit=6');

        $response->assertOk();
        $response->assertJsonCount(4);
        $response->assertJsonPath('0.slug', 'horvatorszag-10-legszebb-strandja');
        $response->assertJsonPath('0.category', 'Tengerpartok');
        $response->assertJsonPath('0.publishedAt', '2026-01-25T00:00:00.000000Z');
        $response->assertJsonPath('0.readingTime', '1 perc');
        $response->assertJsonStructure([
            '*' => [
                'slug',
                'title',
                'excerpt',
                'image',
                'publishedAt',
                'publishedAtLabel',
                'category',
                'categorySlug',
                'readingTime',
            ],
        ]);
    }
}
