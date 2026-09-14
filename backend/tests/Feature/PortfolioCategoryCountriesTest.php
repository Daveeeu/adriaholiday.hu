<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\BlogCategoryTranslation;
use App\Models\Region;
use App\Models\Tour;
use App\Models\TourReferenceOption;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortfolioCategoryCountriesTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_countries_endpoint_returns_options_with_counts(): void
    {
        $category = $this->createCategory('Körutazások', 'korutazasok');
        $croatia = $this->createCountry('HR', 'Horvátország');
        $montenegro = $this->createCountry('ME', 'Montenegró');

        $this->createTour('horvat-tura', $category->id, [$croatia]);
        $this->createTour('horvat-monte-tura', $category->id, [$croatia, $montenegro]);

        $response = $this->getJson('/api/portfolio/categories/korutazasok/countries');

        $response->assertOk();
        $response->assertJsonFragment([
            'code' => 'HR',
            'label' => 'Horvátország',
            'count' => 2,
            'disabled' => false,
        ]);
        $response->assertJsonFragment([
            'code' => 'ME',
            'label' => 'Montenegró',
            'count' => 1,
            'disabled' => false,
        ]);
    }

    public function test_category_offers_endpoint_filters_by_country(): void
    {
        $category = $this->createCategory('Körutazások', 'korutazasok');
        $croatia = $this->createCountry('HR', 'Horvátország');
        $montenegro = $this->createCountry('ME', 'Montenegró');

        $croatiaTour = $this->createTour('horvat-tura', $category->id, [$croatia]);
        $this->createTour('monte-tura', $category->id, [$montenegro]);

        $response = $this->getJson('/api/portfolio/categories/korutazasok/offers?country=HR');

        $response->assertOk();
        $response->assertJsonPath('totalCount', 1);
        $this->assertSame([$croatiaTour->id], collect($response->json('items'))->pluck('id')->all());
    }

    public function test_category_countries_endpoint_omits_countries_without_offers(): void
    {
        $this->createCategory('Körutazások', 'korutazasok');
        $this->createCountry('IT', 'Olaszország');

        $response = $this->getJson('/api/portfolio/categories/korutazasok/countries');

        $response->assertOk();
        $response->assertJsonMissing(['code' => 'IT']);
    }

    private function createCategory(string $name, string $slug): BlogCategory
    {
        $category = BlogCategory::query()->create([
            'active' => true,
            'column' => '1',
            'seo_name' => $slug,
            'sort_order' => 1,
        ]);

        foreach (['hu', 'en', 'de'] as $locale) {
            BlogCategoryTranslation::query()->create([
                'blog_category_id' => $category->id,
                'locale' => $locale,
                'name' => $locale === 'hu' ? $name : $name.' '.strtoupper($locale),
                'seo_name' => $locale === 'hu' ? $slug : $slug.'-'.$locale,
                'seo_auto_generate' => true,
            ]);
        }

        return $category;
    }

    private function createCountry(string $code, string $name): string
    {
        TourReferenceOption::query()->create([
            'type' => 'country',
            'code' => $code,
            'name' => $name,
            'active' => true,
            'sort_order' => 1,
        ]);

        return $code;
    }

    private function createTour(string $slug, int $categoryId, array $countryCodes): Tour
    {
        return Tour::factory()->create([
            'name' => ucfirst(str_replace('-', ' ', $slug)),
            'seo_name' => $slug,
            'region_id' => Region::factory()->create(['slug' => $slug.'-region'])->id,
            'category_ids' => [(string) $categoryId],
            'country_ids' => $countryCodes,
            'sort_order' => 1,
        ]);
    }
}
