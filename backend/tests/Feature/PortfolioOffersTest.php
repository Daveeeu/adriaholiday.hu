<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\BlogCategoryTranslation;
use App\Models\Tour;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortfolioOffersTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_portfolio_offer_detail_returns_active_tour_by_slug(): void
    {
        $response = $this->getJson('/api/portfolio/offers/albania-makedoniaval-fuszerezve');

        $response->assertOk();
        $response->assertJsonPath('seoName', 'albania-makedoniaval-fuszerezve');
        $response->assertJsonPath('name', 'Albania, a Balkán riviérája / Albánia Makedóniával fűszerezve');
        $response->assertJsonPath('active', true);
        $response->assertJsonCount(4, 'priceInformation.included');
        $response->assertJsonCount(6, 'priceInformation.excluded');
        $response->assertJsonCount(7, 'programDays');
        $response->assertJsonPath('priceBox.displayedPrice', '269.600,-Ft/fő-től');
        $response->assertJsonPath('dates.0.priceBox.displayedPrice', '269.600,-Ft/fő-től');
        $response->assertJsonPath('dates.0.status', 'available');
        $response->assertJsonPath('galleryTitle', 'Galéria');
        $response->assertJsonPath('gallerySubtitle', 'Városnézés, tengerpart és balkáni hangulat egy útban.');
        $response->assertJsonCount(10, 'gallery');
        $response->assertJsonStructure([
            'id',
            'name',
            'seoName',
            'shortDescription',
            'listDescription',
            'programBefore',
            'program',
            'inclusions',
            'programDays' => [
                [
                    'id',
                    'dayNumber',
                    'title',
                    'description',
                    'image',
                    'icon',
                    'experienceType',
                    'badges',
                    'active',
                ],
            ],
            'galleryTitle',
            'gallerySubtitle',
            'gallery' => [
                [
                    'id',
                    'tourId',
                    'mediaId',
                    'title',
                    'alt',
                    'caption',
                    'sortOrder',
                    'active',
                    'image' => [
                        'id',
                        'url',
                        'thumbnailUrl',
                        'mimeType',
                    ],
                ],
            ],
            'paymentProgram',
            'prices',
            'discounts',
            'notes',
            'priceBox' => [
                'price',
                'displayedPrice',
                'currency',
                'priceSuffix',
                'discountBadge',
                'discountText',
                'urgencyText',
                'ratingText',
                'minParticipants',
                'maxParticipants',
                'availableSeats',
                'capacity',
                'ctaPrimaryLabel',
                'ctaSecondaryLabel',
            ],
            'priceInformation' => [
                'included' => [
                    ['id', 'text'],
                ],
                'excluded' => [
                    ['id', 'text'],
                ],
            ],
            'price',
            'displayedPrice',
            'image' => [
                'url',
                'thumbnailUrl',
            ],
            'sliderImage',
            'region',
            'dates' => [
                [
                    'id',
                    'tourId',
                    'startDate',
                    'endDate',
                    'price',
                    'displayedPrice',
                    'priceBox' => [
                        'price',
                        'displayedPrice',
                        'discountBadge',
                        'minParticipants',
                        'maxParticipants',
                        'availableSeats',
                        'capacity',
                    ],
                    'status',
                ],
            ],
            'departurePlaces',
            'partnerBonuses',
            'tags',
            'categories',
        ]);

        $data = $response->json();

        foreach ([
            'programBefore',
            'program',
            'inclusions',
            'paymentProgram',
            'prices',
            'discounts',
        ] as $field) {
            $this->assertArrayHasKey($field, $data);
            $this->assertTrue(is_string($data[$field]) || $data[$field] === null);
            if (is_string($data[$field])) {
                $this->assertNotSame('', trim($data[$field]));
            }
        }

        $this->assertArrayHasKey('priceBox', $data);
        $this->assertTrue(is_array($data['priceBox']));
        $this->assertArrayHasKey('inclusions', $data);
        $this->assertArrayHasKey('gallery', $data);
        $this->assertCount(10, $data['gallery']);
        $this->assertSame(10, count(array_unique(array_map(
            static fn (array $item): string => (string) ($item['image']['url'] ?? ''),
            $data['gallery'],
        ))));
        $this->assertArrayHasKey('notes', $data);
        $this->assertNull($data['notes']);
    }

    public function test_public_portfolio_offer_detail_returns_montenegro_tour_by_slug(): void
    {
        $response = $this->getJson('/api/portfolio/offers/montenegro-albania-kincseivel-fuszerezve');

        $response->assertOk();
        $response->assertJsonPath('seoName', 'montenegro-albania-kincseivel-fuszerezve');
        $response->assertJsonPath('name', 'Montenegrói üdülés, Albánia kincseivel fűszerezve');
        $response->assertJsonPath('active', true);
        $response->assertJsonPath('priceBox.displayedPrice', '189.900 Ft/fő-től');
        $response->assertJsonCount(7, 'programDays');
        $response->assertJsonCount(10, 'gallery');
        $response->assertJsonCount(4, 'priceInformation.included');
        $response->assertJsonCount(5, 'priceInformation.excluded');
        $response->assertJsonPath('dates.0.startDate', '2026-09-07');
        $response->assertJsonPath('dates.0.endDate', '2026-09-13');
    }

    public function test_public_portfolio_offer_detail_returns_brugge_london_parizs_tour_by_slug(): void
    {
        $response = $this->getJson('/api/portfolio/offers/brugge---london---parizs-2018');

        $response->assertOk();
        $response->assertJsonPath('seoName', 'brugge---london---parizs-2018');
        $response->assertJsonPath('name', 'Brugge - London - Párizs');
        $response->assertJsonPath('active', true);
        $response->assertJsonPath('priceBox.displayedPrice', '273.600,-Ft/fő-től');
        $response->assertJsonCount(8, 'programDays');
        $response->assertJsonCount(7, 'gallery');
        $response->assertJsonCount(4, 'priceInformation.included');
        $response->assertJsonCount(2, 'priceInformation.excluded');
        $response->assertJsonPath('dates.0.startDate', '2026-09-20');
        $response->assertJsonPath('dates.0.endDate', '2026-09-27');
    }

    public function test_public_portfolio_offer_detail_returns_montenegro_mediterranean_tour_by_slug(): void
    {
        $response = $this->getJson('/api/portfolio/offers/montenegro-a-mediterran-csoda-felpanzioval');

        $response->assertOk();
        $response->assertJsonPath('seoName', 'montenegro-a-mediterran-csoda-felpanzioval');
        $response->assertJsonPath('name', 'Montenegró, a mediterrán csoda félpanzióval');
        $response->assertJsonPath('active', true);
        $response->assertJsonPath('priceBox.displayedPrice', '259.900 Ft/fő-től');
        $response->assertJsonCount(8, 'programDays');
        $response->assertJsonCount(12, 'gallery');
        $response->assertJsonCount(4, 'priceInformation.included');
        $response->assertJsonCount(5, 'priceInformation.excluded');
        $response->assertJsonCount(3, 'dates');
        $response->assertJsonPath('dates.0.startDate', '2026-07-04');
        $response->assertJsonPath('dates.1.startDate', '2026-08-15');
        $response->assertJsonPath('dates.2.startDate', '2026-09-12');
    }

    public function test_public_portfolio_offer_detail_returns_404_for_missing_or_inactive_tours(): void
    {
        Tour::query()
            ->where('seo_name', 'albania-makedoniaval-fuszerezve')
            ->update(['active' => false]);

        $response = $this->getJson('/api/portfolio/offers/albania-makedoniaval-fuszerezve');

        $response->assertNotFound();
        $response->assertJsonPath('message', 'Az ajánlat nem található.');

        $this->getJson('/api/portfolio/offers/nincs-ilyen')
            ->assertNotFound()
            ->assertJsonPath('message', 'Az ajánlat nem található.');
    }

    public function test_public_portfolio_offer_list_returns_paginated_envelope(): void
    {
        $response = $this->getJson('/api/portfolio/offers?page=1&perPage=2');

        $response->assertOk();
        $response->assertJsonStructure([
            'items',
            'totalCount',
            'page',
            'perPage',
        ]);
        $response->assertJsonCount(2, 'items');
        $response->assertJsonPath('page', 1);
        $response->assertJsonPath('perPage', 2);
        $response->assertJsonPath('totalCount', 4);
    }

    public function test_public_portfolio_offer_list_supports_search_and_filters(): void
    {
        $searchResponse = $this->getJson('/api/portfolio/offers?search=albania');

        $searchResponse->assertOk();
        $searchResponse->assertJsonCount(2, 'items');
        $searchResponse->assertJsonFragment(['seoName' => 'albania-makedoniaval-fuszerezve']);
        $searchResponse->assertJsonFragment(['seoName' => 'montenegro-albania-kincseivel-fuszerezve']);

        $categoryResponse = $this->getJson('/api/portfolio/categories/korutazasok/offers');
        $categoryResponse->assertOk();
        $categoryResponse->assertJsonStructure([
            'items',
            'totalCount',
            'page',
            'perPage',
            'recommended',
        ]);

        $regionResponse = $this->getJson('/api/portfolio/regions/austria/offers');
        $regionResponse->assertOk();
        $regionResponse->assertJsonStructure([
            'items',
            'totalCount',
            'page',
            'perPage',
        ]);
        $regionResponse->assertJsonCount(0, 'items');
        $regionResponse->assertJsonPath('totalCount', 0);

        $franceRegionResponse = $this->getJson('/api/portfolio/regions/france/offers');
        $franceRegionResponse->assertOk();
        $franceRegionResponse->assertJsonPath('totalCount', 1);
        $franceRegionResponse->assertJsonFragment(['seoName' => 'brugge---london---parizs-2018']);

        $montenegroRegionResponse = $this->getJson('/api/portfolio/regions/montenegro/offers');
        $montenegroRegionResponse->assertOk();
        $montenegroRegionResponse->assertJsonPath('totalCount', 2);
        $montenegroRegionResponse->assertJsonFragment(['seoName' => 'montenegro-albania-kincseivel-fuszerezve']);
        $montenegroRegionResponse->assertJsonFragment(['seoName' => 'montenegro-a-mediterran-csoda-felpanzioval']);
    }

    public function test_public_portfolio_category_offer_list_filters_by_exact_category_slug(): void
    {
        Tour::query()->update(['active' => false]);

        $roundTripCategory = BlogCategory::query()->updateOrCreate(
            ['seo_name' => 'korutazasok'],
            ['active' => true, 'column' => '1', 'sort_order' => 1],
        );
        BlogCategoryTranslation::query()->updateOrCreate([
            'blog_category_id' => $roundTripCategory->id,
            'locale' => 'hu',
        ], [
            'name' => 'Körutazások',
            'seo_name' => 'korutazasok',
            'seo_auto_generate' => true,
        ]);

        $flightRoundTripCategory = BlogCategory::query()->updateOrCreate(
            ['seo_name' => 'repulos-korutazasok'],
            ['active' => true, 'column' => '1', 'sort_order' => 2],
        );
        BlogCategoryTranslation::query()->updateOrCreate([
            'blog_category_id' => $flightRoundTripCategory->id,
            'locale' => 'hu',
        ], [
            'name' => 'Repülős körutazások',
            'seo_name' => 'repulos-korutazasok',
            'seo_auto_generate' => true,
        ]);

        Tour::factory()->create([
            'name' => 'Buszos körutazás',
            'seo_name' => 'buszos-korutazas',
            'active' => true,
            'featured' => true,
            'recommended' => false,
            'sort_order' => 1,
            'price' => 199000,
            'category_ids' => [(string) $roundTripCategory->id],
        ]);

        Tour::factory()->create([
            'name' => 'Kiemelt körutazás',
            'seo_name' => 'kiemelt-korutazas',
            'active' => true,
            'featured' => true,
            'recommended' => true,
            'sort_order' => 2,
            'price' => 249000,
            'category_ids' => [(string) $roundTripCategory->id],
        ]);

        Tour::factory()->create([
            'name' => 'Repülős körutazás',
            'seo_name' => 'repulos-korutazas',
            'active' => true,
            'featured' => false,
            'recommended' => false,
            'sort_order' => 1,
            'price' => 219000,
            'category_ids' => [(string) $flightRoundTripCategory->id],
        ]);

        $roundTripResponse = $this->getJson('/api/portfolio/categories/korutazasok/offers');
        $roundTripResponse->assertOk();
        $roundTripResponse->assertJsonFragment(['seoName' => 'buszos-korutazas']);
        $roundTripResponse->assertJsonFragment(['seoName' => 'kiemelt-korutazas']);
        $roundTripResponse->assertJsonMissing(['seoName' => 'repulos-korutazas']);
        $roundTripResponse->assertJsonCount(2, 'recommended');
        $this->assertSame(
            ['kiemelt-korutazas', 'buszos-korutazas'],
            array_column($roundTripResponse->json('recommended'), 'seoName'),
        );

        $flightRoundTripResponse = $this->getJson('/api/portfolio/categories/repulos-korutazasok/offers');
        $flightRoundTripResponse->assertOk();
        $flightRoundTripResponse->assertJsonFragment(['seoName' => 'repulos-korutazas']);
        $flightRoundTripResponse->assertJsonMissing(['seoName' => 'buszos-korutazas']);
        $flightRoundTripResponse->assertJsonCount(1, 'recommended');
        $this->assertSame(
            ['repulos-korutazas'],
            array_column($flightRoundTripResponse->json('recommended'), 'seoName'),
        );

        $missingResponse = $this->getJson('/api/portfolio/categories/nincs-ilyen/offers');
        $missingResponse->assertOk();
        $missingResponse->assertJsonPath('totalCount', 0);
        $missingResponse->assertJsonCount(0, 'items');
        $missingResponse->assertJsonCount(0, 'recommended');
    }
}
