<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\BlogCategoryTranslation;
use App\Models\BlogTag;
use App\Models\BlogTagTranslation;
use App\Models\HomepageOffer;
use App\Models\HomepageOfferTranslation;
use App\Models\Region;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDeparturePlace;
use App\Models\TourProgramDay;
use App\Models\TourRegionGroup;
use App\Models\TourReferenceOption;
use App\Models\TourSeasonalGroup;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
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

        $regionGroup = TourRegionGroup::query()->create([
            'active' => true,
            'featured_on_homepage' => false,
            'type' => 'group',
            'name' => 'Teszt csoport',
            'seo_name' => 'teszt-csoport',
            'seo_auto_generate' => false,
            'gallery_id' => null,
            'description' => null,
            'list_below_text' => null,
            'travel_conditions_link' => null,
        ]);

        $seasonalGroup = TourSeasonalGroup::query()->create([
            'active' => true,
            'menu_type' => 'intro',
            'name' => 'Teszt szezon',
            'seo_name' => 'teszt-szezon',
            'seo_auto_generate' => false,
            'box_text' => null,
            'has_offers' => true,
        ]);

        $homepageOffer = HomepageOffer::query()->create([
            'active' => true,
            'sort_order' => 1,
            'image' => null,
            'image_title' => 'Balkán körutazások',
            'link' => '/kategoriak/balkan-korutazasok',
        ]);
        HomepageOfferTranslation::query()->create([
            'homepage_offer_id' => $homepageOffer->id,
            'locale' => 'hu',
            'name' => 'Balkán körutazások',
            'seo_name' => 'balkan-korutazasok',
            'short_description' => 'Teszt leírás',
        ]);

        $departurePlace = TourDeparturePlace::query()->create([
            'active' => true,
            'name' => 'Budapest',
            'city' => 'Budapest',
            'fee' => null,
        ]);

        $fit = $this->createReferenceOption('fit', 'teszt-fit', 'Teszt FIT');
        $programType = $this->createReferenceOption('program-type', 'teszt-program', 'Teszt program típus');
        $travelMode = $this->createReferenceOption('travel-mode', 'teszt-busz', 'Buszos utazás');
        $difficulty = $this->createReferenceOption('difficulty', 'teszt-konnyu', 'Könnyű');
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
            'homepage_offer_id' => $homepageOffer->id,
            'group_id' => $regionGroup->seo_name,
            'seasonal_group_id' => $seasonalGroup->seo_name,
            'departure_place_ids' => [$departurePlace->id],
            'country_ids' => [$countryHu->code, $countryHr->code],
            'tag_ids' => [(string) $tag->id],
            'category_ids' => [(string) $category->id],
            'fit_id' => $fit->code,
            'program_type_id' => $programType->code,
            'travel_mode_id' => $travelMode->code,
            'difficulty_id' => $difficulty->code,
            'priceBox' => [
                'price' => '199900',
                'displayedPrice' => '199 900 Ft-tól',
                'currency' => 'HUF',
                'priceSuffix' => '/ fő',
                'discountBadge' => '-15%',
                'discountText' => 'Előfoglalási kedvezmény',
                'urgencyText' => '18 fő érdeklődött az elmúlt 72 órában',
                'ratingText' => '4.9/5 utasértékelés',
                'minParticipants' => '1',
                'maxParticipants' => '49',
                'availableSeats' => '12',
                'capacity' => '49',
                'ctaPrimaryLabel' => 'Ajánlatot kérek',
                'ctaSecondaryLabel' => 'Lefoglalom az utat',
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
                        'displayedPrice' => '199 900 Ft-tól',
                        'discountBadge' => '-15%',
                        'minParticipants' => '1',
                        'maxParticipants' => '49',
                        'availableSeats' => '12',
                        'capacity' => '49',
                    ],
                    'status' => 'available',
                ],
                [
                    'start_date' => '2026-06-10',
                    'end_date' => '2026-06-15',
                    'price' => 209900,
                    'priceBox' => [
                        'price' => '209900',
                        'displayedPrice' => '209 900 Ft-tól',
                        'discountBadge' => '-10%',
                        'minParticipants' => '1',
                        'maxParticipants' => '49',
                        'availableSeats' => '8',
                        'capacity' => '49',
                    ],
                    'status' => 'planned',
                ],
            ],
            'partner_bonuses' => [
                [
                    'sort_order' => 1,
                    'label' => 'Extra ajándék',
                    'value' => 'Igen',
                ],
            ],
        ]));

        $createResponse->assertCreated();
        $createResponse->assertJsonPath('data.regionLabel', $region->name);
        $createResponse->assertJsonPath('data.homepageOfferId', $homepageOffer->id);
        $createResponse->assertJsonPath('data.homepageOfferIds.0', $homepageOffer->id);
        $createResponse->assertJsonPath('data.homepageOfferLabel', 'Balkán körutazások');
        $createResponse->assertJsonPath('data.homepageOffers.0.id', $homepageOffer->id);
        $createResponse->assertJsonPath('data.homepageOffers.0.title', 'Balkán körutazások');
        $createResponse->assertJsonPath('data.groupLabel', $regionGroup->name);
        $createResponse->assertJsonPath('data.seasonalGroupLabel', $seasonalGroup->name);
        $createResponse->assertJsonPath('data.fitLabel', $fit->name);
        $createResponse->assertJsonPath('data.programTypeLabel', $programType->name);
        $createResponse->assertJsonPath('data.travelModeLabel', $travelMode->name);
        $createResponse->assertJsonPath('data.difficultyLabel', $difficulty->name);
        $createResponse->assertJsonPath('data.priceBox.displayedPrice', '199 900 Ft-tól');
        $createResponse->assertJsonPath('data.dates.0.priceBox.availableSeats', 12);
        $createResponse->assertJsonPath('data.countries.0.label', $countryHu->name);
        $createResponse->assertJsonPath('data.tags.0.label', 'Családi');
        $createResponse->assertJsonPath('data.categories.0.label', 'Klasszikus körutazás');
        $createResponse->assertJsonPath('data.galleryTitle', 'Galéria cím');
        $createResponse->assertJsonPath('data.gallerySubtitle', 'Galéria alcím');
        $createResponse->assertJsonCount(2, 'data.gallery');
        $createResponse->assertJsonPath('data.gallery.0.title', 'Első kép');
        $createResponse->assertJsonPath('data.gallery.0.image.url', $galleryMedia[0]->getUrl());
        $createResponse->assertJsonCount(2, 'data.dates');
        $createResponse->assertJsonCount(1, 'data.partnerBonuses');
        $createResponse->assertJsonCount(2, 'data.priceItems');

        $tourId = (string) $createResponse->json('data.id');

        $this->assertDatabaseHas('tour_dates', [
            'tour_id' => $tourId,
            'start_date' => '2026-05-28 00:00:00',
            'end_date' => '2026-05-31 00:00:00',
            'status' => 'available',
            'price_box_displayed_price' => '199 900 Ft-tól',
            'price_box_available_seats' => 12,
        ]);
        $this->assertDatabaseHas('tours', [
            'id' => $tourId,
            'homepage_offer_id' => $homepageOffer->id,
            'price_box_price' => 199900,
            'price_box_displayed_price' => '199 900 Ft-tól',
            'price_box_available_seats' => 12,
        ]);
        $this->assertDatabaseHas('tour_dates', [
            'tour_id' => $tourId,
            'start_date' => '2026-06-10 00:00:00',
            'end_date' => '2026-06-15 00:00:00',
            'status' => 'planned',
            'price_box_displayed_price' => '209 900 Ft-tól',
            'price_box_available_seats' => 8,
        ]);
        $this->assertDatabaseHas('tour_partner_bonuses', [
            'tour_id' => $tourId,
            'sort_order' => 1,
            'label' => 'Extra ajándék',
            'value' => 'Igen',
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
        $showResponse->assertJsonPath('data.homepageOfferIds.0', $homepageOffer->id);
        $showResponse->assertJsonPath('data.homepageOfferLabel', 'Balkán körutazások');
        $showResponse->assertJsonPath('data.homepageOffers.0.title', 'Balkán körutazások');
        $showResponse->assertJsonPath('data.groupLabel', $regionGroup->name);
        $showResponse->assertJsonPath('data.seasonalGroupLabel', $seasonalGroup->name);
        $showResponse->assertJsonPath('data.fitLabel', $fit->name);
        $showResponse->assertJsonPath('data.programTypeLabel', $programType->name);
        $showResponse->assertJsonPath('data.travelModeLabel', $travelMode->name);
        $showResponse->assertJsonPath('data.difficultyLabel', $difficulty->name);
        $showResponse->assertJsonPath('data.countries.0.label', $countryHu->name);
        $showResponse->assertJsonPath('data.tags.0.label', 'Családi');
        $showResponse->assertJsonPath('data.categories.0.label', 'Klasszikus körutazás');
        $showResponse->assertJsonPath('data.departurePlaces.0.name', 'Budapest');
        $showResponse->assertJsonCount(1, 'data.partnerBonuses');
        $showResponse->assertJsonCount(2, 'data.priceItems');
        $showResponse->assertJsonCount(2, 'data.gallery');

        $updateResponse = $this->patchJson("/api/admin/tours/{$tourId}", $this->payload([
            'name' => 'Teszt körutazás módosítva',
            'seo_name' => 'teszt-korutazas-modositva',
            'region_id' => $region->id,
            'homepage_offer_id' => null,
            'group_id' => $regionGroup->seo_name,
            'seasonal_group_id' => $seasonalGroup->seo_name,
            'departure_place_ids' => [$departurePlace->id],
            'country_ids' => [$countryHu->code, $countryHr->code],
            'tag_ids' => [(string) $tag->id],
            'category_ids' => [(string) $category->id],
            'fit_id' => $fit->code,
            'program_type_id' => $programType->code,
            'travel_mode_id' => $travelMode->code,
            'difficulty_id' => $difficulty->code,
            'priceBox' => [
                'price' => '229900',
                'displayedPrice' => '229 900 Ft-tól',
                'currency' => 'HUF',
                'priceSuffix' => '/ fő',
                'discountBadge' => '-10%',
                'discountText' => 'Előfoglalási kedvezmény',
                'urgencyText' => '14 fő érdeklődött az elmúlt 72 órában',
                'ratingText' => '4.8/5 utasértékelés',
                'minParticipants' => '1',
                'maxParticipants' => '49',
                'availableSeats' => '10',
                'capacity' => '49',
                'ctaPrimaryLabel' => 'Ajánlatot kérek',
                'ctaSecondaryLabel' => 'Lefoglalom az utat',
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
                        'displayedPrice' => '229 900 Ft-tól',
                        'discountBadge' => '-10%',
                        'minParticipants' => '1',
                        'maxParticipants' => '49',
                        'availableSeats' => '10',
                        'capacity' => '49',
                    ],
                    'status' => 'sold_out',
                ],
            ],
            'partner_bonuses' => [
                [
                    'sort_order' => 2,
                    'label' => 'Új bónusz',
                    'value' => 'Ajándék csomag',
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
        $updateResponse->assertJsonPath('data.homepageOfferId', null);
        $updateResponse->assertJsonPath('data.homepageOfferIds', []);
        $updateResponse->assertJsonPath('data.homepageOfferLabel', null);
        $updateResponse->assertJsonPath('data.homepageOffers', []);
        $updateResponse->assertJsonPath('data.fitLabel', $fit->name);
        $updateResponse->assertJsonPath('data.programTypeLabel', $programType->name);
        $updateResponse->assertJsonPath('data.travelModeLabel', $travelMode->name);
        $updateResponse->assertJsonPath('data.difficultyLabel', $difficulty->name);
        $updateResponse->assertJsonPath('data.priceBox.displayedPrice', '229 900 Ft-tól');
        $updateResponse->assertJsonPath('data.dates.0.priceBox.availableSeats', 10);
        $updateResponse->assertJsonCount(1, 'data.dates');
        $updateResponse->assertJsonCount(1, 'data.partnerBonuses');
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
            'price_box_displayed_price' => '229 900 Ft-tól',
            'price_box_available_seats' => 10,
        ]);
        $this->assertDatabaseHas('tours', [
            'id' => $tourId,
            'homepage_offer_id' => null,
            'price_box_price' => 229900,
            'price_box_displayed_price' => '229 900 Ft-tól',
            'price_box_available_seats' => 10,
        ]);
        $this->assertDatabaseHas('tour_partner_bonuses', [
            'tour_id' => $tourId,
            'sort_order' => 2,
            'label' => 'Új bónusz',
            'value' => 'Ajándék csomag',
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
        $this->assertDatabaseMissing('tour_dates', [
            'tour_id' => $tourId,
            'start_date' => '2026-05-28 00:00:00',
            'end_date' => '2026-05-31 00:00:00',
        ]);

        $updatedShowResponse = $this->getJson("/api/admin/tours/{$tourId}");
        $updatedShowResponse->assertOk();
        $updatedShowResponse->assertJsonPath('data.regionLabel', $region->name);
        $updatedShowResponse->assertJsonPath('data.homepageOfferLabel', null);
        $updatedShowResponse->assertJsonPath('data.groupLabel', $regionGroup->name);
        $updatedShowResponse->assertJsonPath('data.seasonalGroupLabel', $seasonalGroup->name);
        $updatedShowResponse->assertJsonPath('data.fitLabel', $fit->name);
        $updatedShowResponse->assertJsonPath('data.programTypeLabel', $programType->name);
        $updatedShowResponse->assertJsonPath('data.travelModeLabel', $travelMode->name);
        $updatedShowResponse->assertJsonPath('data.difficultyLabel', $difficulty->name);
        $updatedShowResponse->assertJsonPath('data.countries.0.label', $countryHu->name);
        $updatedShowResponse->assertJsonPath('data.tags.0.label', 'Családi');
        $updatedShowResponse->assertJsonPath('data.categories.0.label', 'Klasszikus körutazás');
        $updatedShowResponse->assertJsonPath('data.departurePlaces.0.name', 'Budapest');
        $updatedShowResponse->assertJsonCount(1, 'data.partnerBonuses');
    }

    public function test_tour_update_accepts_numeric_program_day_ids_and_syncs_program_days(): void
    {
        $this->actingAsTourAdmin();

        $tour = Tour::query()->create([
            'sort_order' => 1,
            'active' => true,
            'featured' => true,
            'recommended' => false,
            'partner_offer' => false,
            'image_offer' => false,
            'xml_enabled' => true,
            'slider_image_enabled' => false,
            'slider_text_enabled' => false,
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

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'sort_order' => 1,
            'active' => true,
            'featured' => true,
            'recommended' => false,
            'partner_offer' => false,
            'image_offer' => true,
            'xml_enabled' => true,
            'slider_image_enabled' => false,
            'slider_text_enabled' => false,
            'name' => 'Teszt körutazás',
            'seo_name' => 'teszt-korutazas',
            'seo_auto_generate' => false,
            'action1' => null,
            'action2' => null,
            'list_description' => 'Teszt list leírás',
            'short_description' => 'Teszt rövid leírás',
            'program_pdf_path' => null,
            'program_pdf_file' => null,
            'slider_image' => null,
            'program_before' => null,
            'program' => null,
            'inclusions' => null,
            'payment_program' => null,
            'prices' => null,
            'discounts' => null,
            'notes' => null,
            'priceBox' => [
                'price' => '199900',
                'displayedPrice' => '199 900 Ft-tól',
                'currency' => 'HUF',
                'priceSuffix' => '/ fő',
                'discountBadge' => '-15%',
                'discountText' => 'Előfoglalási kedvezmény',
                'urgencyText' => '18 fő érdeklődött az elmúlt 72 órában',
                'ratingText' => '4.9/5 utasértékelés',
                'minParticipants' => '1',
                'maxParticipants' => '49',
                'availableSeats' => '12',
                'capacity' => '49',
                'ctaPrimaryLabel' => 'Ajánlatot kérek',
                'ctaSecondaryLabel' => 'Lefoglalom az utat',
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
            'group_id' => null,
            'seasonal_group_id' => null,
            'fit_id' => null,
            'program_type_id' => null,
            'travel_mode_id' => null,
            'difficulty_id' => null,
            'country_ids' => [],
            'tag_ids' => [],
            'category_ids' => [],
            'price' => 199900,
            'displayed_price' => '199.900,-Ft -tól',
            'slider_text' => 'Teszt slider szöveg',
            'departure_place_ids' => [],
            'dates' => [],
            'partner_bonuses' => [],
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
            'partner_offer' => false,
            'image_offer' => false,
            'xml_enabled' => false,
            'slider_image_enabled' => false,
            'slider_text_enabled' => false,
            'name' => $name,
            'seo_name' => Str::slug($name).'-'.Str::random(8),
            'seo_auto_generate' => false,
            'list_description' => null,
            'short_description' => null,
            'slider_image' => null,
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
