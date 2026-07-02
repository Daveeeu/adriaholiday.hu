<?php

namespace Tests\Feature;

use App\Models\Region;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PortfolioRegionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_portfolio_regions_returns_only_featured_regions_with_apartment_counts(): void
    {
        $response = $this->getJson('/api/portfolio/regions');

        $response->assertOk();
        $response->assertJsonCount(4);
        $response->assertJsonPath('0.slug', 'greece');
        $response->assertJsonPath('1.slug', 'bulgaria');
        $response->assertJsonPath('2.slug', 'montenegro');
        $response->assertJsonPath('3.slug', 'croatia');
        $response->assertJsonMissing(['slug' => 'italy']);
        $response->assertJsonStructure([
            '*' => [
                'slug',
                'name',
                'image',
                'description',
                'apartmentCount',
                'portfolioFeatured',
                'portfolioSortOrder',
            ],
        ]);

        $greece = Region::query()->where('slug', 'greece')->firstOrFail();

        $response->assertJsonPath('0.apartmentCount', $greece->apartments()->where('is_active', true)->count());
    }

    public function test_admin_can_update_region_portfolio_fields(): void
    {
        $user = User::factory()->create([
            'email' => 'portfolio-region-editor@example.com',
        ]);
        $user->assignRole('Super Admin');

        Sanctum::actingAs($user);

        $region = Region::query()->where('slug', 'greece')->firstOrFail();

        $response = $this->patchJson("/api/admin/regions/{$region->id}", [
            'name' => $region->name,
            'slug' => $region->slug,
            'country_code' => $region->country_code,
            'timezone' => $region->timezone,
            'currency' => $region->currency,
            'hero_image_url' => $region->hero_image_url,
            'summary' => $region->summary,
            'description' => $region->description,
            'is_active' => true,
            'sort_order' => $region->sort_order,
            'portfolio_featured' => true,
            'portfolio_sort_order' => 99,
            'portfolio_image_url' => 'https://example.com/portfolio-image.jpg',
            'portfolio_short_description' => 'Frissített rövid leírás.',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.portfolioFeatured', true);
        $response->assertJsonPath('data.portfolioSortOrder', 99);
        $response->assertJsonPath('data.portfolioImageUrl', 'https://example.com/portfolio-image.jpg');
        $response->assertJsonPath('data.portfolioShortDescription', 'Frissített rövid leírás.');
    }
}
