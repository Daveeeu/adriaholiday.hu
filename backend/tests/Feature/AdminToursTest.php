<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\BlogCategoryTranslation;
use App\Models\BlogTag;
use App\Models\BlogTagTranslation;
use App\Models\Booking;
use App\Models\Region;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDeparturePlace;
use App\Models\TourProgramDay;
use App\Models\TourReferenceOption;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AdminToursTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_tour_store_show_and_update_persist_and_return_dates(): void
    {
        $this->actingAsTourAdmin();

        $region = Region::query()->create([
            'slug' => 'teszt-regio',
            'name' => 'Teszt régió',
            'country_code' => 'HR',
            'timezone' => 'Europe/Zagreb',
            'currency' => 'EUR',
            'hero_image_url' => null,
            'summary' => null,
            'description' => null,
            'is_active' => true,
            'sort_order' => 1,
            'portfolio_featured' => false,
            'portfolio_sort_order' => 1,
            'portfolio_image_url' => null,
            'portfolio_short_description' => null,
        ]);

        $departurePlace = TourDeparturePlace::query()->create([
            'active' => true,
            'name' => 'Budapest',
            'city' => 'Budapest',
            'fee' => null,
        ]);

        $programType = $this->createReferenceOption('program-type', 'teszt-program', 'Teszt program típus');
        $travelMode = $this->createReferenceOption('travel-mode', 'teszt-busz', 'Buszos utazás');
        $countryHu = $this->createReferenceOption('country', 'hu', 'Magyarország');
        $countryHr = $this->createReferenceOption('country', 'hr', 'Horvátország');

        $tag = BlogTag::query()->create([
            'active' => true,
            'sort_order' => 1,
        ]);
        BlogTagTranslation::query()->create([
            'blog_tag_id' => $tag->id,
            'locale' => 'hu',
            'name' => 'Családi',
        ]);

        $category = BlogCategory::query()->create([
            'active' => true,
            'column' => '1',
            'seo_name' => 'klasszikus-korutazas',
            'sort_order' => 1,
        ]);
        BlogCategoryTranslation::query()->create([
            'blog_category_id' => $category->id,
            'locale' => 'hu',
            'name' => 'Klasszikus körutazás',
            'seo_name' => 'klasszikus-korutazas',
            'seo_auto_generate' => true,
        ]);

        $galleryMedia = [
            $this->createGalleryMedia('Bibione galéria 1'),
            $this->createGalleryMedia('Bibione galéria 2'),
            $this->createGalleryMedia('Bibione galéria 3'),
        ];

        $createResponse = $this->postJson('/api/admin/tours', $this->payload([
            'name' => 'Teszt körutazás',
            'seo_name' => 'teszt-korutazas',
            'region_id' => $region->id,
            'departure_place_ids' => [$departurePlace->id],
            'country_ids' => [$countryHu->code, $countryHr->code],
            'tag_ids' => [(string) $tag->id],
            'category_ids' => [(string) $category->id],
            'program_type_id' => $programType->code,
            'travel_mode_id' => $travelMode->code,
            'priceBox' => [
                'price' => '199900',
                'currency' => 'HUF',
                'priceSuffix' => '/ fő',
                'discountBadge' => '-15%',
                'discountText' => 'Előfoglalási kedvezmény',
            ],
            'galleryTitle' => 'Galéria cím',
            'gallerySubtitle' => 'Galéria alcím',
            'gallery' => [
                [
                    'media_id' => (string) $galleryMedia[0]->id,
                    'title' => 'Első kép',
                    'alt' => 'Első galéria kép alt',
                    'caption' => 'Első galéria képaláírás',
                    'sort_order' => 1,
                    'active' => true,
                ],
                [
                    'media_id' => (string) $galleryMedia[1]->id,
                    'title' => 'Második kép',
                    'alt' => 'Második galéria kép alt',
                    'caption' => 'Második galéria képaláírás',
                    'sort_order' => 2,
                    'active' => true,
                ],
                [
                    'media_id' => (string) $galleryMedia[2]->id,
                    'title' => 'Harmadik kép',
                    'alt' => 'Harmadik galéria kép alt',
                    'caption' => 'Harmadik galéria képaláírás',
                    'sort_order' => 3,
                    'active' => false,
                ],
            ],
            'dates' => [
                [
                    'start_date' => '2026-05-28',
                    'end_date' => '2026-05-31',
                    'price' => 199900,
                    'priceBox' => [
                        'price' => '199900',
                        'discountBadge' => '-15%',
                    ],
                    'capacity' => '12',
                    'status' => 'available',
                ],
                [
                    'start_date' => '2026-06-10',
                    'end_date' => '2026-06-15',
                    'price' => 209900,
                    'priceBox' => [
                        'price' => '209900',
                        'discountBadge' => '-10%',
                    ],
                    'capacity' => '8',
                    'status' => 'available',
                ],
            ],
        ]));

        $createResponse->assertCreated();

        foreach (['imageOffer', 'action1', 'groupId', 'homepageOfferId', 'partnerBonuses', 'priceBox.minParticipants', 'priceBox.ctaPrimaryLabel'] as $removed) {
            $createResponse->assertJsonMissingPath("data.{$removed}");
        }
        $createResponse->assertJsonPath('data.regionLabel', $region->name);
        $createResponse->assertJsonPath('data.programTypeLabel', $programType->name);
        $createResponse->assertJsonPath('data.travelModeLabel', $travelMode->name);
        $createResponse->assertJsonPath('data.priceBox.displayedPrice', '199.900 Ft / fő');
        $createResponse->assertJsonPath('data.dates.0.capacity', 12);
        $createResponse->assertJsonPath('data.countries.0.label', $countryHu->name);
        $createResponse->assertJsonPath('data.tags.0.label', 'Családi');
        $createResponse->assertJsonPath('data.categories.0.label', 'Klasszikus körutazás');
        $createResponse->assertJsonPath('data.galleryTitle', 'Galéria cím');
        $createResponse->assertJsonPath('data.gallerySubtitle', 'Galéria alcím');
        $createResponse->assertJsonCount(3, 'data.gallery');
        $createResponse->assertJsonPath('data.gallery.2.active', false);
        $createResponse->assertJsonPath('data.gallery.0.title', 'Első kép');
        $createResponse->assertJsonPath('data.gallery.0.image.url', $galleryMedia[0]->getUrl());
        $createResponse->assertJsonCount(2, 'data.dates');
        $createResponse->assertJsonCount(2, 'data.priceItems');

        $tourId = (string) $createResponse->json('data.id');

        $this->assertDatabaseHas('tour_dates', [
            'tour_id' => $tourId,
            'start_date' => '2026-05-28 00:00:00',
            'end_date' => '2026-05-31 00:00:00',
            'status' => 'available',
            'capacity' => 12,
        ]);
        $this->assertDatabaseHas('tours', [
            'id' => $tourId,
            'price_box_price' => 199900,
            'couponable' => 1,
        ]);
        $this->assertDatabaseHas('tour_dates', [
            'tour_id' => $tourId,
            'start_date' => '2026-06-10 00:00:00',
            'end_date' => '2026-06-15 00:00:00',
            'status' => 'available',
            'capacity' => 8,
        ]);
        $this->assertDatabaseHas('tour_price_items', [
            'tour_id' => $tourId,
            'type' => 'included',
            'text' => 'Autóbuszos utazás',
            'sort_order' => 1,
            'active' => 1,
        ]);
        $this->assertDatabaseHas('tour_price_items', [
            'tour_id' => $tourId,
            'type' => 'excluded',
            'text' => 'Utasbiztosítás',
            'sort_order' => 1,
            'active' => 1,
        ]);
        $this->assertDatabaseHas('tour_gallery_items', [
            'tour_id' => $tourId,
            'media_id' => $galleryMedia[0]->id,
            'title' => 'Első kép',
            'sort_order' => 1,
            'active' => 1,
        ]);
        $this->assertDatabaseHas('tour_gallery_items', [
            'tour_id' => $tourId,
            'media_id' => $galleryMedia[1]->id,
            'title' => 'Második kép',
            'sort_order' => 2,
            'active' => 1,
        ]);
        $this->assertDatabaseHas('tour_gallery_items', [
            'tour_id' => $tourId,
            'media_id' => $galleryMedia[2]->id,
            'title' => 'Harmadik kép',
            'sort_order' => 3,
            'active' => 0,
        ]);

        $showResponse = $this->getJson("/api/admin/tours/{$tourId}");
        $showResponse->assertOk();
        $showResponse->assertJsonPath('data.regionLabel', $region->name);
        $showResponse->assertJsonPath('data.programTypeLabel', $programType->name);
        $showResponse->assertJsonPath('data.travelModeLabel', $travelMode->name);
        $showResponse->assertJsonPath('data.countries.0.label', $countryHu->name);
        $showResponse->assertJsonPath('data.tags.0.label', 'Családi');
        $showResponse->assertJsonPath('data.categories.0.label', 'Klasszikus körutazás');
        $showResponse->assertJsonPath('data.departurePlaces.0.name', 'Budapest');
        $showResponse->assertJsonCount(2, 'data.priceItems');
        $showResponse->assertJsonCount(3, 'data.gallery');

        $updateResponse = $this->patchJson("/api/admin/tours/{$tourId}", $this->payload([
            'name' => 'Teszt körutazás módosítva',
            'seo_name' => 'teszt-korutazas-modositva',
            'couponable' => false,
            'region_id' => $region->id,
            'departure_place_ids' => [$departurePlace->id],
            'country_ids' => [$countryHu->code, $countryHr->code],
            'tag_ids' => [(string) $tag->id],
            'category_ids' => [(string) $category->id],
            'program_type_id' => $programType->code,
            'travel_mode_id' => $travelMode->code,
            'priceBox' => [
                'price' => '229900',
                'currency' => 'HUF',
                'priceSuffix' => '/ fő',
                'discountBadge' => '-10%',
                'discountText' => 'Előfoglalási kedvezmény',
            ],
            'galleryTitle' => 'Galéria cím módosítva',
            'gallerySubtitle' => 'Galéria alcím módosítva',
            'gallery' => [
                [
                    'media_id' => (string) $galleryMedia[1]->id,
                    'title' => 'Második kép módosítva',
                    'alt' => 'Második galéria kép alt módosítva',
                    'caption' => 'Második galéria képaláírás módosítva',
                    'sort_order' => 1,
                    'active' => true,
                ],
                [
                    'media_id' => (string) $galleryMedia[0]->id,
                    'title' => 'Első kép módosítva',
                    'alt' => 'Első galéria kép alt módosítva',
                    'caption' => 'Első galéria képaláírás módosítva',
                    'sort_order' => 2,
                    'active' => true,
                ],
            ],
            'dates' => [
                [
                    'start_date' => '2026-07-01',
                    'end_date' => '2026-07-04',
                    'price' => 229900,
                    'priceBox' => [
                        'price' => '229900',
                        'discountBadge' => '-10%',
                    ],
                    'capacity' => '10',
                    'status' => 'sold_out',
                ],
            ],
            'price_items' => [
                [
                    'type' => 'included',
                    'text' => 'Szállás',
                    'sort_order' => 1,
                    'active' => true,
                ],
                [
                    'type' => 'excluded',
                    'text' => 'Belépők',
                    'sort_order' => 1,
                    'active' => false,
                ],
            ],
        ]));

        $updateResponse->assertOk();
        $updateResponse->assertJsonPath('data.programTypeLabel', $programType->name);
        $updateResponse->assertJsonPath('data.travelModeLabel', $travelMode->name);
        $updateResponse->assertJsonPath('data.priceBox.displayedPrice', '229.900 Ft / fő');
        $updateResponse->assertJsonPath('data.dates.0.capacity', 10);
        $updateResponse->assertJsonCount(1, 'data.dates');
        $updateResponse->assertJsonCount(2, 'data.priceItems');
        $updateResponse->assertJsonPath('data.galleryTitle', 'Galéria cím módosítva');
        $updateResponse->assertJsonPath('data.gallerySubtitle', 'Galéria alcím módosítva');
        $updateResponse->assertJsonCount(2, 'data.gallery');
        $updateResponse->assertJsonPath('data.gallery.0.title', 'Második kép módosítva');
        $updateResponse->assertJsonPath('data.gallery.1.title', 'Első kép módosítva');

        $this->assertSame(1, TourDate::query()->where('tour_id', $tourId)->count());
        $this->assertDatabaseHas('tour_dates', [
            'tour_id' => $tourId,
            'start_date' => '2026-07-01 00:00:00',
            'end_date' => '2026-07-04 00:00:00',
            'status' => 'sold_out',
            'capacity' => 10,
        ]);
        $this->assertDatabaseHas('tours', [
            'id' => $tourId,
            'price_box_price' => 229900,
            'couponable' => 0,
        ]);
        $this->assertDatabaseHas('tour_price_items', [
            'tour_id' => $tourId,
            'type' => 'included',
            'text' => 'Szállás',
            'sort_order' => 1,
            'active' => 1,
        ]);
        $this->assertDatabaseHas('tour_price_items', [
            'tour_id' => $tourId,
            'type' => 'excluded',
            'text' => 'Belépők',
            'sort_order' => 1,
            'active' => 0,
        ]);
        $this->assertDatabaseMissing('tour_gallery_items', [
            'tour_id' => $tourId,
            'title' => 'Harmadik kép',
        ]);
        $this->assertDatabaseHas('tour_gallery_items', [
            'tour_id' => $tourId,
            'media_id' => $galleryMedia[1]->id,
            'title' => 'Második kép módosítva',
            'sort_order' => 1,
            'active' => 1,
        ]);
        $this->assertDatabaseHas('tour_gallery_items', [
            'tour_id' => $tourId,
            'media_id' => $galleryMedia[0]->id,
            'title' => 'Első kép módosítva',
            'sort_order' => 2,
            'active' => 1,
        ]);
        $this->assertSoftDeleted('tour_dates', [
            'tour_id' => $tourId,
            'start_date' => '2026-05-28 00:00:00',
            'end_date' => '2026-05-31 00:00:00',
        ]);

        $updatedShowResponse = $this->getJson("/api/admin/tours/{$tourId}");
        $updatedShowResponse->assertOk();
        $updatedShowResponse->assertJsonPath('data.regionLabel', $region->name);
        $updatedShowResponse->assertJsonPath('data.programTypeLabel', $programType->name);
        $updatedShowResponse->assertJsonPath('data.travelModeLabel', $travelMode->name);
        $updatedShowResponse->assertJsonPath('data.countries.0.label', $countryHu->name);
        $updatedShowResponse->assertJsonPath('data.tags.0.label', 'Családi');
        $updatedShowResponse->assertJsonPath('data.categories.0.label', 'Klasszikus körutazás');
        $updatedShowResponse->assertJsonPath('data.departurePlaces.0.name', 'Budapest');
    }

    public function test_tour_update_accepts_numeric_program_day_ids_and_syncs_program_days(): void
    {
        $this->actingAsTourAdmin();

        $tour = Tour::query()->create([
            'sort_order' => 1,
            'active' => true,
            'featured' => true,
            'recommended' => false,
            'xml_enabled' => true,
            'name' => 'Albánia teszt körút',
            'seo_name' => 'albania-teszt-korut',
            'seo_auto_generate' => false,
            'list_description' => 'Teszt lista leírás',
            'short_description' => 'Teszt rövid leírás',
            'price' => 269600,
            'displayed_price' => '269.600 Ft/fő-től',
        ]);

        $firstDay = $tour->programDays()->create([
            'sort_order' => 1,
            'day_number' => 1,
            'title' => 'Első nap',
            'description' => '<p>Első leírás</p>',
            'image' => 'https://example.com/day-1.jpg',
            'icon' => 'bus',
            'experience_type' => 'Utazás',
            'badges' => ['Indulás'],
            'active' => true,
        ]);

        $secondDay = $tour->programDays()->create([
            'sort_order' => 2,
            'day_number' => 2,
            'title' => 'Második nap',
            'description' => '<p>Második leírás</p>',
            'image' => 'https://example.com/day-2.jpg',
            'icon' => 'camera',
            'experience_type' => 'Városnézés',
            'badges' => ['Fotóstop'],
            'active' => true,
        ]);

        $showResponse = $this->getJson("/api/admin/tours/{$tour->id}");
        $showResponse->assertOk();
        $showResponse->assertJsonPath('data.programDays.0.id', $firstDay->id);
        $showResponse->assertJsonPath('data.programDays.1.id', $secondDay->id);

        $payload = $this->payload([
            'name' => 'Albánia teszt körút frissítve',
            'seo_name' => 'albania-teszt-korut-frissitve',
            'program_days' => [
                [
                    'id' => $firstDay->id,
                    'clientId' => 'existing-day-1',
                    'sort_order' => 1,
                    'day_number' => 1,
                    'title' => 'Első nap frissítve',
                    'description' => '<p>Frissített első leírás</p>',
                    'image' => 'https://example.com/day-1-updated.jpg',
                    'icon' => 'bus',
                    'experience_type' => 'Utazás',
                    'badges' => ['Indulás', 'Belgrád'],
                    'active' => true,
                ],
                [
                    'clientId' => 'new-day-client-id',
                    'sort_order' => 2,
                    'day_number' => 3,
                    'title' => 'Új harmadik nap',
                    'description' => '<p>Új programnap</p>',
                    'image' => 'https://example.com/day-3.jpg',
                    'icon' => 'map-pin',
                    'experience_type' => 'Kirándulás',
                    'badges' => ['Új nap'],
                    'active' => true,
                ],
            ],
        ]);

        $updateResponse = $this->patchJson("/api/admin/tours/{$tour->id}", $payload);

        $updateResponse->assertOk();
        $updateResponse->assertJsonMissingValidationErrors(['program_days.0.id']);
        $updateResponse->assertJsonPath('data.programDays.0.id', $firstDay->id);
        $updateResponse->assertJsonPath('data.programDays.0.title', 'Első nap frissítve');
        $updateResponse->assertJsonCount(2, 'data.programDays');

        $tour->refresh();
        $tour->load('programDays');

        $this->assertCount(2, $tour->programDays);
        $this->assertDatabaseHas('tour_program_days', [
            'id' => $firstDay->id,
            'tour_id' => $tour->id,
            'title' => 'Első nap frissítve',
            'day_number' => 1,
        ]);
        $this->assertDatabaseMissing('tour_program_days', [
            'id' => $secondDay->id,
        ]);

        $newDay = TourProgramDay::query()
            ->where('tour_id', $tour->id)
            ->where('title', 'Új harmadik nap')
            ->first();

        $this->assertNotNull($newDay);
        $this->assertNotSame($firstDay->id, $newDay?->id);
    }

    public function test_a_new_tour_starts_in_the_round_trips_category(): void
    {
        $this->actingAsTourAdmin();

        $category = BlogCategory::query()->create(['active' => true, 'column' => '1', 'seo_name' => 'korutazasok', 'sort_order' => 1]);
        BlogCategoryTranslation::query()->create(['blog_category_id' => $category->id, 'locale' => 'hu', 'name' => 'Körutazások', 'seo_name' => 'korutazasok', 'seo_auto_generate' => true]);

        $this->getJson('/api/admin/tours/defaults')
            ->assertOk()
            ->assertJsonPath('data.categoryIds', [(string) $category->id])
            ->assertJsonPath('data.categories.0.label', 'Körutazások');
    }

    public function test_only_who_may_create_tours_gets_the_new_tour_defaults(): void
    {
        Sanctum::actingAs(User::query()->create(['name' => 'Viewer', 'email' => 'viewer@example.com', 'password' => 'password']));

        $this->getJson('/api/admin/tours/defaults')->assertForbidden();
    }

    public function test_partner_settings_left_at_the_tour_defaults_keep_following_the_tour(): void
    {
        $this->actingAsTourAdmin();

        $tour = Tour::factory()->create([
            'region_id' => Region::factory()->create(['name' => 'Horvátország'])->id,
            'accommodation' => 'Hotel***',
            'accommodation_info' => 'Medencés szálloda',
            'partner_xml' => null,
        ]);

        $defaults = $this->getJson("/api/admin/tours/{$tour->id}")
            ->assertOk()
            ->assertJsonPath('data.partnerXmlDefaults.accommodation_name', 'Hotel')
            ->assertJsonPath('data.partnerXmlDefaults.country_id', 6)
            ->json('data.partnerXmlDefaults');

        // The editor shows the defaults; the office changes only the city.
        $this->patchJson("/api/admin/tours/{$tour->id}", $this->payload([
            'seo_name' => 'horvat-tengerpart',
            'region_id' => $tour->region_id,
            'accommodation' => 'Apartman',
            'partnerXml' => [...$defaults, 'city' => 'Makarska', 'accommodation_description_travelmax' => '<p>Medencés szálloda</p>'],
        ]))->assertOk()
            ->assertJsonPath('data.partnerXml.city', 'Makarska')
            ->assertJsonPath('data.partnerXml.accommodation_name', null)
            ->assertJsonPath('data.partnerXml.accommodation_description_travelmax', null)
            ->assertJsonPath('data.partnerXml.travel_types.travelmax', [])
            // The accommodation changed with it: the default follows.
            ->assertJsonPath('data.partnerXmlDefaults.accommodation_name', 'Apartman');
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'sort_order' => 1,
            'active' => true,
            'featured' => true,
            'recommended' => false,
            'xml_enabled' => true,
            'couponable' => true,
            'name' => 'Teszt körutazás',
            'seo_name' => 'teszt-korutazas',
            'seo_auto_generate' => false,
            'list_description' => 'Teszt list leírás',
            'short_description' => 'Teszt rövid leírás',
            'program_before' => null,
            'program' => null,
            'inclusions' => null,
            'payment_program' => null,
            'prices' => null,
            'discounts' => null,
            'notes' => null,
            'priceBox' => [
                'price' => '199900',
                'currency' => 'HUF',
                'priceSuffix' => '/ fő',
                'discountBadge' => '-15%',
                'discountText' => 'Előfoglalási kedvezmény',
            ],
            'price_items' => [
                [
                    'type' => 'included',
                    'text' => 'Autóbuszos utazás',
                    'sort_order' => 1,
                    'active' => true,
                ],
                [
                    'type' => 'excluded',
                    'text' => 'Utasbiztosítás',
                    'sort_order' => 1,
                    'active' => true,
                ],
            ],
            'region_id' => null,
            'program_type_id' => null,
            'travel_mode_id' => null,
            'country_ids' => [],
            'tag_ids' => [],
            'category_ids' => [],
            'price' => 199900,
            'displayed_price' => '199.900,-Ft -tól',
            'slider_text' => 'Teszt slider szöveg',
            'departure_place_ids' => [],
            'dates' => [],
            'gallery' => [],
        ], $overrides);
    }

    private function createGalleryMedia(string $name): Media
    {
        $tour = Tour::query()->create([
            'sort_order' => 999,
            'active' => false,
            'featured' => false,
            'recommended' => false,
            'xml_enabled' => false,
            'name' => $name,
            'seo_name' => Str::slug($name).'-'.Str::random(8),
            'seo_auto_generate' => false,
            'list_description' => null,
            'short_description' => null,
            'price' => null,
            'displayed_price' => null,
        ]);

        $binary = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn7Wf8AAAAASUVORK5CYII=',
        );

        return $tour->addMediaFromString($binary)
            ->usingName($name)
            ->usingFileName(Str::slug($name).'.png')
            ->toMediaCollection('slider');
    }

    public function test_tour_dates_persist_their_extras_and_duplicate_copies_them(): void
    {
        $this->actingAsTourAdmin();
        Permission::findOrCreate('tours.duplicate', 'web');
        auth()->user()->givePermissionTo('tours.duplicate');

        $response = $this->postJson('/api/admin/tours', $this->payload([
            'name' => 'Felár teszt',
            'seo_name' => 'felar-teszt',
            'dates' => [
                [
                    'startDate' => '2026-11-28',
                    'endDate' => '2026-11-29',
                    'price' => 45900,
                    'status' => 'available',
                    'extras' => [
                        ['name' => 'Vacsora', 'price' => 8800, 'priceUnit' => 'per_person', 'chargeRule' => 'optional'],
                        ['name' => 'Repülőjegy', 'price' => 30000, 'priceUnit' => 'per_person', 'chargeRule' => 'mandatory'],
                        [
                            'name' => 'Egyágyas felár',
                            'price' => 13800,
                            'priceUnit' => 'per_booking',
                            'chargeRule' => 'solo_traveller',
                            'choices' => "Egyedül szeretnék lenni a szobában\r\nSzeretnék szobatársat\n",
                        ],
                    ],
                ],
            ],
        ]));

        $response->assertCreated();
        $response->assertJsonPath('data.dates.0.extras.0.name', 'Vacsora');
        $response->assertJsonPath('data.dates.0.extras.1.chargeRule', 'mandatory');
        $response->assertJsonPath('data.dates.0.extras.2.chargeRule', 'solo_traveller');
        $response->assertJsonPath('data.dates.0.extras.2.choices', ['Egyedül szeretnék lenni a szobában', 'Szeretnék szobatársat']);
        $response->assertJsonPath('data.dates.0.extras.2.priceUnit', 'per_booking');
        $response->assertJsonPath('data.dates.0.extras.2.price', 13800);

        $tourId = $response->json('data.id');
        $this->getJson("/api/admin/tours/{$tourId}")->assertJsonCount(3, 'data.dates.0.extras');

        $duplicate = $this->postJson("/api/admin/tours/{$tourId}/duplicate");
        $duplicate->assertCreated();
        $duplicate->assertJsonCount(3, 'data.dates.0.extras');
        $duplicate->assertJsonPath('data.dates.0.extras.1.name', 'Repülőjegy');
        $duplicate->assertJsonPath('data.dates.0.extras.2.choices.1', 'Szeretnék szobatársat');
    }

    public function test_dates_may_share_extra_choices_and_repeated_choices_of_one_extra_are_merged(): void
    {
        $this->actingAsTourAdmin();
        $soloSupplement = [
            'name' => 'Egyágyas felár',
            'price' => 29800,
            'priceUnit' => 'per_person',
            'chargeRule' => 'solo_traveller',
            'choices' => "Egyedül szeretnék lenni a szobában\nSzeretnék szobatársat\nSzeretnék szobatársat",
        ];

        $this->postJson('/api/admin/tours', $this->payload([
            'seo_name' => 'kozos-valasztasok',
            'dates' => [
                ['startDate' => '2027-05-21', 'endDate' => '2027-05-24', 'price' => 99800, 'status' => 'available', 'extras' => [$soloSupplement]],
                ['startDate' => '2027-08-13', 'endDate' => '2027-08-16', 'price' => 99800, 'status' => 'available', 'extras' => [$soloSupplement]],
            ],
        ]))->assertCreated()
            ->assertJsonPath('data.dates.0.extras.0.choices', ['Egyedül szeretnék lenni a szobában', 'Szeretnék szobatársat'])
            ->assertJsonPath('data.dates.1.extras.0.choices', ['Egyedül szeretnék lenni a szobában', 'Szeretnék szobatársat']);
    }

    public function test_saving_a_tour_keeps_its_dates_so_bookings_stay_linked(): void
    {
        $this->actingAsTourAdmin();
        $date = ['startDate' => '2026-11-28', 'endDate' => '2026-11-29', 'price' => 45900, 'status' => 'available'];
        $tourId = $this->postJson('/api/admin/tours', $this->payload([
            'seo_name' => 'foglalt-ut',
            'dates' => [$date, ['startDate' => '2026-12-05', 'endDate' => '2026-12-06', 'price' => 45900, 'status' => 'available']],
        ]))->assertCreated()->json('data.id');
        $tour = Tour::query()->findOrFail($tourId);
        $bookedDate = $tour->dates()->orderBy('start_date')->firstOrFail();
        $booking = Booking::factory()->create(['tour_id' => $tour->id, 'tour_date_id' => $bookedDate->id]);

        $this->patchJson("/api/admin/tours/{$tourId}", $this->payload([
            'seo_name' => 'foglalt-ut',
            'dates' => [
                ['id' => (string) $bookedDate->id, ...$date, 'startDate' => '2026-11-27', 'price' => 49900],
                ['id' => 'client-generated-id', 'startDate' => '2027-01-09', 'endDate' => '2027-01-10', 'price' => 39900, 'status' => 'available'],
            ],
        ]))->assertOk();

        $this->assertSame($bookedDate->id, $booking->fresh()->tour_date_id);
        $this->assertSame('2026-11-27', $bookedDate->fresh()->start_date->toDateString());

        $removedDate = TourDate::withTrashed()->where('tour_id', $tourId)->whereDate('start_date', '2026-12-05')->firstOrFail();
        $this->assertTrue($removedDate->trashed());
        $lateBooking = Booking::factory()->create(['tour_id' => $tour->id, 'tour_date_id' => $removedDate->id]);
        $this->assertSame('2026-12-05', $lateBooking->tourDate->start_date->toDateString());
        $this->assertEquals(49900, $bookedDate->fresh()->price);
        $this->assertSame(['2026-11-27', '2027-01-09'], $tour->dates()->orderBy('start_date')->get()->map(
            fn (TourDate $tourDate): string => $tourDate->start_date->toDateString(),
        )->all());
    }

    public function test_accommodation_and_meals_with_their_info_are_saved_and_shown_on_the_trip_page(): void
    {
        $this->actingAsTourAdmin();
        $tourId = $this->postJson('/api/admin/tours', $this->payload([
            'seo_name' => 'szallas-info',
            'active' => true,
            'accommodation' => 'Hotel***',
            'accommodationInfo' => '2 ágyas szoba',
            'catering' => 'reggeli',
            'cateringInfo' => 'Vacsora igényelhető: 38.900 Ft/fő',
        ]))->assertCreated()
            ->assertJsonPath('data.accommodationInfo', '2 ágyas szoba')
            ->json('data.id');

        $this->getJson('/api/portfolio/offers/'.Tour::query()->findOrFail($tourId)->seo_name)
            ->assertOk()
            ->assertJsonPath('accommodation', 'Hotel***')
            ->assertJsonPath('accommodationInfo', '2 ágyas szoba')
            ->assertJsonPath('meals', 'Reggeli')
            ->assertJsonPath('mealsInfo', 'Vacsora igényelhető: 38.900 Ft/fő');

        // A save from a form without these fields keeps them.
        $this->patchJson("/api/admin/tours/{$tourId}", $this->payload(['seo_name' => 'szallas-info', 'active' => true]))->assertOk();
        $this->assertSame('2 ágyas szoba', Tour::query()->findOrFail($tourId)->accommodation_info);
    }

    public function test_route_stops_are_saved_and_kept_when_a_form_leaves_them_out(): void
    {
        $this->actingAsTourAdmin();
        $tourId = $this->postJson('/api/admin/tours', $this->payload([
            'seo_name' => 'utvonal',
            'routeStops' => [
                ['name' => ' Belgrád ', 'latitude' => 44.8125, 'longitude' => 20.4612, 'accommodation' => false, 'clientId' => 'a'],
                ['name' => 'Shkoder', 'latitude' => '42.0683', 'longitude' => '19.5126', 'accommodation' => true],
            ],
        ]))->assertCreated()
            ->assertJsonPath('data.routeStops.0', ['name' => 'Belgrád', 'latitude' => 44.8125, 'longitude' => 20.4612, 'accommodation' => false])
            ->assertJsonPath('data.routeStops.1.accommodation', true)
            ->json('data.id');

        $this->patchJson("/api/admin/tours/{$tourId}", $this->payload(['seo_name' => 'utvonal']))->assertOk();
        $this->assertCount(2, Tour::query()->findOrFail($tourId)->route_stops);

        $this->patchJson("/api/admin/tours/{$tourId}", $this->payload(['seo_name' => 'utvonal', 'routeStops' => []]))->assertOk();
        $this->assertNull(Tour::query()->findOrFail($tourId)->route_stops);

        $this->patchJson("/api/admin/tours/{$tourId}", $this->payload([
            'seo_name' => 'utvonal',
            'routeStops' => [['name' => '', 'latitude' => 95, 'longitude' => 20]],
        ]))->assertStatus(422)->assertJsonValidationErrors(['route_stops.0.name', 'route_stops.0.latitude']);
    }

    public function test_a_date_saves_the_departure_places_it_offers(): void
    {
        $this->actingAsTourAdmin();
        [$miskolc, $budapest] = TourDeparturePlace::factory()->count(2)->create(['active' => true]);
        $tourId = $this->postJson('/api/admin/tours', $this->payload([
            'seo_name' => 'felszallas-idopontonkent',
            'departurePlaceIds' => [(string) $miskolc->id, (string) $budapest->id],
            'dates' => [
                ['startDate' => '2027-05-26', 'endDate' => '2027-05-30', 'price' => 179600, 'status' => 'available', 'departurePlaceIds' => [(string) $budapest->id]],
                ['startDate' => '2027-10-06', 'endDate' => '2027-10-10', 'price' => 179600, 'status' => 'available', 'departurePlaceIds' => []],
            ],
        ]))->assertCreated()
            ->assertJsonPath('data.dates.0.departurePlaceIds', [$budapest->id])
            ->assertJsonPath('data.dates.1.departurePlaceIds', [])
            ->json('data.id');

        $this->assertSame([$budapest->id], Tour::query()->findOrFail($tourId)->dates()->orderBy('start_date')->firstOrFail()->departure_place_ids);
    }

    public function test_departure_places_keep_their_per_tour_fee_on_save_and_duplicate(): void
    {
        $this->actingAsTourAdmin();
        Permission::findOrCreate('tours.duplicate', 'web');
        auth()->user()->givePermissionTo('tours.duplicate');

        $bok = TourDeparturePlace::query()->create(['active' => true, 'name' => 'Budapest BOK csarnok', 'city' => 'Budapest', 'fee' => null]);
        $miskolc = TourDeparturePlace::query()->create(['active' => true, 'name' => 'Miskolc', 'city' => 'Miskolc', 'fee' => 1000]);

        $response = $this->postJson('/api/admin/tours', $this->payload([
            'seo_name' => 'felszallasi-dij-teszt',
            'departure_place_ids' => [$bok->id, $miskolc->id],
            'departurePlaceFees' => [$bok->id => 4700, $miskolc->id => ''],
        ]));

        $response->assertCreated();
        $places = collect($response->json('data.departurePlaces'))->keyBy('name');
        $this->assertEquals(4700, $places['Budapest BOK csarnok']['tourFee']);
        $this->assertNull($places['Miskolc']['tourFee']);
        $this->assertEquals(1000, $places['Miskolc']['fee']);

        $duplicate = $this->postJson('/api/admin/tours/'.$response->json('data.id').'/duplicate');
        $duplicate->assertCreated();
        $this->assertEquals(4700, collect($duplicate->json('data.departurePlaces'))->firstWhere('name', 'Budapest BOK csarnok')['tourFee']);
    }

    public function test_tour_date_extras_are_validated(): void
    {
        $this->actingAsTourAdmin();

        $response = $this->postJson('/api/admin/tours', $this->payload([
            'seo_name' => 'felar-validacio',
            'dates' => [
                [
                    'startDate' => '2026-11-28',
                    'endDate' => '2026-11-29',
                    'extras' => [
                        ['name' => '', 'price' => -1, 'priceUnit' => 'per_night', 'chargeRule' => 'sometimes'],
                    ],
                ],
            ],
        ]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors([
            'dates.0.extras.0.name',
            'dates.0.extras.0.price',
            'dates.0.extras.0.price_unit',
            'dates.0.extras.0.charge_rule',
        ]);
    }

    public function test_a_rejected_save_explains_in_hungarian_what_is_missing(): void
    {
        $this->actingAsTourAdmin();
        app()->setLocale('hu');

        $tourId = $this->postJson('/api/admin/tours', $this->payload(['seo_name' => 'gdansk']))->assertCreated()->json('data.id');

        $this->patchJson("/api/admin/tours/{$tourId}", $this->payload([
            'seo_name' => 'gdansk',
            'gallery' => [['clientId' => 'new-row', 'mediaId' => '', 'image' => '']],
            'dates' => [['startDate' => '2027-06-13', 'endDate' => '2027-06-10']],
        ]))
            ->assertUnprocessable()
            ->assertJsonPath('errors', [
                'gallery.0.media_id' => ['Az egyik galéria sorhoz nincs kép kiválasztva. Válassz képet, vagy töröld a sort.'],
                'dates.0.end_date' => ['A(z) időpont vége nem lehet korábbi, mint időpont kezdete.'],
            ])
            ->assertJsonPath('message', 'Az egyik galéria sorhoz nincs kép kiválasztva. Válassz képet, vagy töröld a sort. (és még 1 hiba)');
    }

    public function test_a_date_capacity_cannot_go_below_its_booked_passengers_and_free_seats_are_shown(): void
    {
        $this->actingAsTourAdmin();
        app()->setLocale('hu');
        $date = ['startDate' => '2027-06-10', 'endDate' => '2027-06-13', 'price' => 99900, 'status' => 'available', 'capacity' => '10'];
        $tourId = $this->postJson('/api/admin/tours', $this->payload(['seo_name' => 'kapacitas', 'dates' => [$date]]))
            ->assertCreated()
            ->assertJsonPath('data.dates.0.capacity', 10)
            ->assertJsonPath('data.dates.0.freeSeats', 10)
            ->json('data.id');
        $tourDate = TourDate::query()->where('tour_id', $tourId)->sole();
        Booking::factory()->create([
            'booking_type' => 'tour_booking',
            'status' => 'new',
            'cancelled' => false,
            'tour_id' => $tourId,
            'tour_date_id' => $tourDate->id,
            'passenger_count' => 6,
        ]);

        $this->patchJson("/api/admin/tours/{$tourId}", $this->payload([
            'seo_name' => 'kapacitas',
            'dates' => [['id' => (string) $tourDate->id, ...$date, 'capacity' => '5']],
        ]))
            ->assertUnprocessable()
            ->assertJsonPath('errors', [
                'dates.0.capacity' => ['A(z) 2027.06.10. időpontra már 6 utas foglalt, a maximum létszám ennél nem lehet kevesebb.'],
            ]);

        $this->patchJson("/api/admin/tours/{$tourId}", $this->payload([
            'seo_name' => 'kapacitas',
            'dates' => [['id' => (string) $tourDate->id, ...$date, 'capacity' => '8']],
        ]))
            ->assertOk()
            ->assertJsonPath('data.dates.0.capacity', 8)
            ->assertJsonPath('data.dates.0.seatsHeld', 6)
            ->assertJsonPath('data.dates.0.freeSeats', 2);

        // An admin page from before the per-date capacity sends none: the stored one stays.
        $outdatedDate = collect(['id' => (string) $tourDate->id, ...$date])->except('capacity')->all();
        $this->patchJson("/api/admin/tours/{$tourId}", $this->payload(['seo_name' => 'kapacitas', 'dates' => [$outdatedDate]]))
            ->assertOk()
            ->assertJsonPath('data.dates.0.capacity', 8);

        $this->patchJson("/api/admin/tours/{$tourId}", $this->payload([
            'seo_name' => 'kapacitas',
            'dates' => [['id' => (string) $tourDate->id, ...$date, 'capacity' => '']],
        ]))
            ->assertOk()
            ->assertJsonPath('data.dates.0.capacity', null)
            ->assertJsonPath('data.dates.0.freeSeats', null);
    }

    private function actingAsTourAdmin(): void
    {
        $permissions = ['tours.viewAny', 'tours.view', 'tours.create', 'tours.update'];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Tour Test Admin', 'web');
        $role->syncPermissions($permissions);

        $user = User::query()->create([
            'name' => 'Tour Test Admin',
            'email' => 'tour-test-admin@example.com',
            'password' => 'password',
        ]);

        $user->assignRole($role);

        Sanctum::actingAs($user);
    }

    private function createReferenceOption(string $type, string $code, string $name): TourReferenceOption
    {
        return TourReferenceOption::query()->create([
            'type' => $type,
            'code' => $code,
            'name' => $name,
            'active' => true,
            'sort_order' => 1,
        ]);
    }
}
