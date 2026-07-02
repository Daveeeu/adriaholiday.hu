<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\BlogCategoryTranslation;
use App\Models\BlogTag;
use App\Models\BlogTagTranslation;
use App\Models\PortfolioFilterChip;
use App\Models\Region;
use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortfolioFilterChipsTest extends TestCase
{
    use RefreshDatabase;

    public function test_category_filters_endpoint_returns_chips_with_count_and_disabled_fields(): void
    {
        $category = $this->createCategory('Körutazások', 'korutazasok');
        $beachTagId = $this->createTag('Tengerpart');

        PortfolioFilterChip::query()->create([
            'scope_type' => 'global',
            'label' => 'Tengerpart',
            'slug' => 'tengerpart',
            'icon' => 'waves',
            'filter_type' => 'theme',
            'filter_value' => $beachTagId,
            'sort_order' => 1,
            'active' => true,
            'hide_when_zero' => false,
        ]);

        $this->createTour('buszos-tengerpart', $category->id, [$beachTagId], 'bus', 199000);

        $response = $this->getJson('/api/portfolio/categories/korutazasok/filters');

        $response->assertOk();
        $response->assertJsonFragment([
            'label' => 'Tengerpart',
            'slug' => 'tengerpart',
            'count' => 1,
            'disabled' => false,
        ]);
    }

    public function test_hide_when_zero_true_omits_empty_chip(): void
    {
        $this->createCategory('Körutazások', 'korutazasok');
        $tagId = $this->createTag('Repülős');

        PortfolioFilterChip::query()->create([
            'scope_type' => 'global',
            'label' => 'Repülős utak',
            'slug' => 'repulos-utak',
            'icon' => 'plane',
            'filter_type' => 'theme',
            'filter_value' => $tagId,
            'sort_order' => 1,
            'active' => true,
            'hide_when_zero' => true,
        ]);

        $response = $this->getJson('/api/portfolio/categories/korutazasok/filters');

        $response->assertOk();
        $response->assertJsonMissing(['slug' => 'repulos-utak']);
    }

    public function test_hide_when_zero_false_returns_disabled_chip_for_zero_results(): void
    {
        $this->createCategory('Körutazások', 'korutazasok');
        $tagId = $this->createTag('Repülős');

        PortfolioFilterChip::query()->create([
            'scope_type' => 'global',
            'label' => 'Repülős utak',
            'slug' => 'repulos-utak',
            'icon' => 'plane',
            'filter_type' => 'theme',
            'filter_value' => $tagId,
            'sort_order' => 1,
            'active' => true,
            'hide_when_zero' => false,
        ]);

        $response = $this->getJson('/api/portfolio/categories/korutazasok/filters');

        $response->assertOk();
        $response->assertJsonFragment([
            'slug' => 'repulos-utak',
            'count' => 0,
            'disabled' => true,
        ]);
    }

    public function test_category_offers_endpoint_filters_by_single_chip_slug(): void
    {
        $category = $this->createCategory('Körutazások', 'korutazasok');

        PortfolioFilterChip::query()->create([
            'scope_type' => 'global',
            'label' => 'Buszos utak',
            'slug' => 'buszos-utak',
            'icon' => 'bus',
            'filter_type' => 'travel_mode',
            'filter_value' => 'bus',
            'sort_order' => 1,
            'active' => true,
            'hide_when_zero' => false,
        ]);

        $busTour = $this->createTour('buszos-ut', $category->id, [], 'bus', 199000);
        $planeTour = $this->createTour('repulos-ut', $category->id, [], 'plane', 259000);

        $response = $this->getJson('/api/portfolio/categories/korutazasok/offers?filters=buszos-utak');

        $response->assertOk();
        $response->assertJsonPath('totalCount', 1);
        $this->assertSame([$busTour->id], collect($response->json('items'))->pluck('id')->all());
        $this->assertNotContains($planeTour->id, collect($response->json('items'))->pluck('id')->all());
    }

    public function test_category_offers_endpoint_supports_combined_filters(): void
    {
        $category = $this->createCategory('Körutazások', 'korutazasok');
        $beachTagId = $this->createTag('Tengerpart');

        PortfolioFilterChip::query()->insert([
            [
                'scope_type' => 'global',
                'scope_value' => null,
                'label' => 'Tengerpart',
                'slug' => 'tengerpart',
                'icon' => 'waves',
                'filter_type' => 'theme',
                'filter_value' => $beachTagId,
                'filter_config' => null,
                'sort_order' => 1,
                'active' => true,
                'hide_when_zero' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'scope_type' => 'global',
                'scope_value' => null,
                'label' => 'Buszos utak',
                'slug' => 'buszos-utak',
                'icon' => 'bus',
                'filter_type' => 'travel_mode',
                'filter_value' => 'bus',
                'filter_config' => null,
                'sort_order' => 2,
                'active' => true,
                'hide_when_zero' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $matchingTour = $this->createTour('buszos-tengerpart', $category->id, [$beachTagId], 'bus', 199000);
        $this->createTour('repulos-tengerpart', $category->id, [$beachTagId], 'plane', 239000);
        $this->createTour('buszos-varos', $category->id, [], 'bus', 189000);

        $response = $this->getJson('/api/portfolio/categories/korutazasok/offers?filters=tengerpart,buszos-utak');

        $response->assertOk();
        $response->assertJsonPath('totalCount', 1);
        $this->assertSame([$matchingTour->id], collect($response->json('items'))->pluck('id')->all());
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

    private function createTag(string $name): string
    {
        $tag = BlogTag::query()->create([
            'active' => true,
            'sort_order' => 1,
        ]);

        foreach (['hu', 'en', 'de'] as $locale) {
            BlogTagTranslation::query()->create([
                'blog_tag_id' => $tag->id,
                'locale' => $locale,
                'name' => $locale === 'hu' ? $name : $name.' '.strtoupper($locale),
            ]);
        }

        return (string) $tag->id;
    }

    private function createTour(
        string $slug,
        int $categoryId,
        array $tagIds,
        string $travelModeId,
        float $price,
    ): Tour {
        return Tour::factory()->create([
            'name' => ucfirst(str_replace('-', ' ', $slug)),
            'seo_name' => $slug,
            'region_id' => Region::factory()->create(['slug' => $slug.'-region'])->id,
            'travel_mode_id' => $travelModeId,
            'category_ids' => [(string) $categoryId],
            'tag_ids' => $tagIds,
            'price' => $price,
            'sort_order' => 1,
        ]);
    }
}
