<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PortfolioFeaturedToursTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_portfolio_featured_tours_returns_active_featured_tours_in_sort_order(): void
    {
        $response = $this->getJson('/api/portfolio/featured-tours');

        $response->assertOk();
        $response->assertJsonCount(4, 'items');
        $response->assertJsonPath('items.0.name', 'Albania, a Balkán riviérája / Albánia Makedóniával fűszerezve');
        $response->assertJsonPath('items.0.sortOrder', 6);
        $response->assertJsonPath('items.0.seoName', 'albania-makedoniaval-fuszerezve');
        $response->assertJsonPath('items.1.name', 'Montenegrói üdülés, Albánia kincseivel fűszerezve');
        $response->assertJsonPath('items.1.sortOrder', 7);
        $response->assertJsonPath('items.1.seoName', 'montenegro-albania-kincseivel-fuszerezve');
        $response->assertJsonPath('items.2.name', 'Brugge - London - Párizs');
        $response->assertJsonPath('items.2.sortOrder', 8);
        $response->assertJsonPath('items.2.seoName', 'brugge---london---parizs-2018');
        $response->assertJsonPath('items.3.name', 'Montenegró, a mediterrán csoda félpanzióval');
        $response->assertJsonPath('items.3.sortOrder', 9);
        $response->assertJsonPath('items.3.seoName', 'montenegro-a-mediterran-csoda-felpanzioval');
        $response->assertJsonStructure([
            'items' => [
                '*' => [
                    'id',
                    'name',
                    'seoName',
                    'shortDescription',
                    'listDescription',
                    'price',
                    'displayedPrice',
                    'image' => [
                        'url',
                        'thumbnailUrl',
                    ],
                    'duration',
                    'departureDate',
                    'link',
                ],
            ],
        ]);
    }

    public function test_limit_query_is_respected(): void
    {
        $response = $this->getJson('/api/portfolio/featured-tours?limit=2');

        $response->assertOk();
        $response->assertJsonCount(2, 'items');
    }

    public function test_admin_tour_updates_are_reflected_in_public_featured_tours(): void
    {
        $user = User::factory()->create([
            'email' => 'portfolio-featured-tour-editor@example.com',
        ]);
        $user->assignRole('Super Admin');

        Sanctum::actingAs($user);

        $tour = Tour::query()
            ->where('seo_name', 'albania-makedoniaval-fuszerezve')
            ->with(['dates', 'partnerBonuses', 'departurePlaces'])
            ->firstOrFail();

        $payload = $this->tourPayload($tour, [
            'name' => 'Bibione családi körutazás - frissítve',
            'short_description' => 'Frissített rövid leírás.',
            'list_description' => 'Frissített rövid leírás.',
            'displayed_price' => '199.900,-Ft -tól',
            'price' => 199900,
        ]);

        $this->patchJson("/api/admin/tours/{$tour->id}", $payload)
            ->assertOk();

        $response = $this->getJson('/api/portfolio/featured-tours');

        $response->assertOk();
        $response->assertJsonPath('items.0.name', 'Bibione családi körutazás - frissítve');
        $response->assertJsonPath('items.0.displayedPrice', '199.900,-Ft -tól');
        $response->assertJsonPath('items.0.shortDescription', 'Frissített rövid leírás.');
    }

    public function test_inactive_or_unfeatured_tours_are_not_returned(): void
    {
        $user = User::factory()->create([
            'email' => 'portfolio-featured-tour-filter-editor@example.com',
        ]);
        $user->assignRole('Super Admin');

        Sanctum::actingAs($user);

        $tour = Tour::query()
            ->where('seo_name', 'albania-makedoniaval-fuszerezve')
            ->with(['dates', 'partnerBonuses', 'departurePlaces'])
            ->firstOrFail();

        $payload = $this->tourPayload($tour, [
            'active' => false,
            'featured' => false,
        ]);

        $this->patchJson("/api/admin/tours/{$tour->id}", $payload)
            ->assertOk();

        $response = $this->getJson('/api/portfolio/featured-tours');

        $response->assertOk();
        $response->assertJsonCount(3, 'items');
        $response->assertJsonMissing(['seoName' => 'albania-makedoniaval-fuszerezve']);
        $response->assertJsonPath('items.0.seoName', 'montenegro-albania-kincseivel-fuszerezve');
        $response->assertJsonPath('items.1.seoName', 'brugge---london---parizs-2018');
        $response->assertJsonPath('items.2.seoName', 'montenegro-a-mediterran-csoda-felpanzioval');
    }

    private function tourPayload(Tour $tour, array $overrides = []): array
    {
        $dates = $tour->dates->map(fn ($date) => [
            'start_date' => $date->start_date?->toDateString(),
            'end_date' => $date->end_date?->toDateString(),
            'price' => $date->price,
            'status' => $date->status,
        ])->all();

        $partnerBonuses = $tour->partnerBonuses->map(fn ($bonus) => [
            'sort_order' => $bonus->sort_order,
            'label' => $bonus->label,
            'value' => $bonus->value,
        ])->all();

        $payload = array_merge([
            'sort_order' => $tour->sort_order,
            'active' => $tour->active,
            'featured' => $tour->featured,
            'recommended' => $tour->recommended,
            'partner_offer' => $tour->partner_offer,
            'image_offer' => $tour->image_offer,
            'xml_enabled' => $tour->xml_enabled,
            'slider_image_enabled' => $tour->slider_image_enabled,
            'slider_text_enabled' => $tour->slider_text_enabled,
            'name' => $tour->name,
            'seo_name' => $tour->seo_name,
            'seo_auto_generate' => $tour->seo_auto_generate,
            'action1' => $tour->action1,
            'action2' => $tour->action2,
            'list_description' => $tour->list_description,
            'short_description' => $tour->short_description,
            'program_pdf_path' => $tour->program_pdf_path,
            'program_pdf_file' => $tour->program_pdf_file,
            'slider_image' => $tour->slider_image,
            'program_before' => $tour->program_before,
            'program' => $tour->program,
            'inclusions' => $tour->inclusions,
            'payment_program' => $tour->payment_program,
            'prices' => $tour->prices,
            'discounts' => $tour->discounts,
            'notes' => $tour->notes,
            'region_id' => $tour->region_id,
            'group_id' => $tour->group_id,
            'seasonal_group_id' => $tour->seasonal_group_id,
            'fit_id' => $tour->fit_id,
            'program_type_id' => $tour->program_type_id,
            'travel_mode_id' => $tour->travel_mode_id,
            'difficulty_id' => $tour->difficulty_id,
            'price' => $tour->price,
            'displayed_price' => $tour->displayed_price,
            'slider_text' => $tour->slider_text,
            'departure_place_ids' => $tour->departurePlaces->pluck('id')->values()->all(),
            'country_ids' => $tour->country_ids ?? [],
            'tag_ids' => $tour->tag_ids ?? [],
            'category_ids' => $tour->category_ids ?? [],
            'dates' => $dates,
            'partner_bonuses' => $partnerBonuses,
        ], $overrides);

        return $payload;
    }
}
