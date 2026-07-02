<?php

namespace Tests\Feature;

use App\Models\HomepageOffer;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PortfolioHomepageOffersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_portfolio_homepage_offers_returns_active_offers_in_sort_order(): void
    {
        $response = $this->getJson('/api/portfolio/homepage-offers');

        $response->assertOk();
        $response->assertJsonCount(6, 'items');
        $response->assertJsonPath('items.0.name', 'Körutazások');
        $response->assertJsonPath('items.0.sortOrder', 1);
        $response->assertJsonPath('items.1.name', 'Repülős körutazások');
        $response->assertJsonPath('items.5.name', 'Egzotikus üdülések');
        $response->assertJsonStructure([
            'items' => [
                '*' => [
                    'id',
                    'name',
                    'seoName',
                    'shortDescription',
                    'link',
                    'image' => [
                        'url',
                        'thumbnailUrl',
                    ],
                    'sortOrder',
                    'active',
                ],
            ],
        ]);
    }

    public function test_admin_updates_are_reflected_in_public_portfolio_homepage_offers(): void
    {
        $user = User::factory()->create([
            'email' => 'homepage-offer-portfolio-editor@example.com',
        ]);
        $user->assignRole('Super Admin');

        Sanctum::actingAs($user);

        $offer = HomepageOffer::query()
            ->where('sort_order', 1)
            ->with('translations')
            ->firstOrFail();

        $payload = [
            'active' => false,
            'sort_order' => 99,
            'image' => $offer->image,
            'image_title' => $offer->image_title,
            'link' => $offer->link,
            'translations' => [
                'hu' => [
                    'name' => $offer->translations->firstWhere('locale', 'hu')?->name,
                    'seo_name' => $offer->translations->firstWhere('locale', 'hu')?->seo_name,
                    'seo_auto_generate' => true,
                    'short_description' => $offer->translations->firstWhere('locale', 'hu')?->short_description,
                ],
                'en' => [
                    'name' => $offer->translations->firstWhere('locale', 'en')?->name,
                    'seo_name' => $offer->translations->firstWhere('locale', 'en')?->seo_name,
                    'seo_auto_generate' => true,
                    'short_description' => $offer->translations->firstWhere('locale', 'en')?->short_description,
                ],
                'de' => [
                    'name' => $offer->translations->firstWhere('locale', 'de')?->name,
                    'seo_name' => $offer->translations->firstWhere('locale', 'de')?->seo_name,
                    'seo_auto_generate' => true,
                    'short_description' => $offer->translations->firstWhere('locale', 'de')?->short_description,
                ],
            ],
        ];

        $this->patchJson("/api/admin/homepage-offers/{$offer->id}", $payload)
            ->assertOk();

        $response = $this->getJson('/api/portfolio/homepage-offers');

        $response->assertOk();
        $response->assertJsonCount(5, 'items');
        $response->assertJsonPath('items.0.name', 'Repülős körutazások');
        $response->assertJsonMissing(['name' => 'Körutazások']);
    }
}
