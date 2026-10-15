<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\LegacyImportRecord;
use App\Models\LegacyMediaFile;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDateExtra;
use App\Models\TourDeparturePlace;
use App\Models\TourGalleryItem;
use App\Models\User;
use App\Support\Tour\TourDateStatus;
use App\Support\Tour\TourExtraChargeRule;
use App\Support\Tour\TourExtraPriceUnit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\PendingCommand;
use Laravel\Sanctum\Sanctum;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\Concerns\FakesLegacyImages;
use Tests\TestCase;

class LegacyCatalogImportTest extends TestCase
{
    use FakesLegacyImages, RefreshDatabase;

    private const CATALOG = __DIR__.'/../Fixtures/legacy-catalog/catalog.json';

    protected function setUp(): void
    {
        parent::setUp();

        // The fixture's dates are read as of the export day.
        $this->travelTo('2026-10-15 12:00:00');
        // Reports go to the private disk; never onto the real one.
        Storage::fake('local');
        config(['services.legacy_adria.request_delay_ms' => 0]);
        $this->fakeLegacyImages();
    }

    public function test_validation_reports_the_invalid_offer_and_the_file_summary(): void
    {
        $this->artisan('adria:catalog:validate', ['file' => self::CATALOG])
            ->expectsOutputToContain('40 (hibas-ajanlat): The name field is required.')
            ->assertFailed();
    }

    public function test_a_dry_run_writes_nothing_but_its_report(): void
    {
        $this->artisan('adria:catalog:import', ['file' => self::CATALOG, '--dry-run' => true])->assertSuccessful();

        $this->assertSame(0, Tour::withTrashed()->count());
        $this->assertSame(0, TourDeparturePlace::query()->count());
        $this->assertSame(0, LegacyImportRecord::query()->count());
        $this->assertCount(2, Storage::disk('local')->files('legacy-import'));

        $report = json_decode(Storage::disk('local')->get(collect(Storage::disk('local')->files('legacy-import'))->first(fn (string $path): bool => str_ends_with($path, '.json'))), true);
        $this->assertSame(['create' => 4, 'invalid' => 1], $report['summary']['by_action']);
        $this->assertSame([1155], $report['summary']['archived']);
    }

    public function test_the_import_writes_every_offer_with_its_dates_extras_places_galleries_and_original_json(): void
    {
        $this->importCatalog()->assertFailed(); // offer 40 is invalid; the others are imported

        $tour = Tour::query()->where('legacy_id', 10)->firstOrFail();

        $this->assertSame('svajc---a-hofodte-alpoktol', $tour->seo_name);
        $this->assertSame('Luzern és Chamonix', $tour->subtitle);
        $this->assertSame('Luzern-Gruyeres-Chamonix', $tour->short_description);
        $this->assertTrue($tour->active);
        $this->assertTrue($tour->featured);
        $this->assertSame(3, $tour->featured_order);
        $this->assertSame('Svájci körutazás', $tour->seo_title);
        $this->assertSame('Alpok és tavak', $tour->seo_description);
        $this->assertSame('bus', $tour->travel_mode_id);
        $this->assertSame('Hotel***', $tour->accommodation);
        $this->assertSame('reggeli', $tour->catering);
        $this->assertEquals(229900, $tour->price);
        $this->assertSame('<p>A program változhat.</p>', $tour->program_footer);
        $this->assertSame('<p>Belépők: 40 CHF</p>', $tour->tickets);
        $this->assertSame(['ch'], $tour->country_ids);
        $this->assertSame(['Foci EB 2024'], $tour->legacy_attributes['unmapped']['regions']);
        $this->assertSame(['AKCIÓS Utazások'], $tour->legacy_attributes['unmapped']['offer_groups']);
        $this->assertSame(['lélegzetelállító tájakon'], $tour->legacy_attributes['unmapped']['region_groups']);
        $this->assertSame('10!8!3', $tour->legacy_attributes['admin_list_row']['order']);
        $this->assertCount(2, $tour->category_ids); // Körutazások, Adventi barangolások

        // The legacy HTML, sanitized, with its image served from our storage.
        $this->assertStringStartsWith('<h2>Svájc</h2><p><strong>1. nap:</strong> <em>indulás</em></p><table border="1">', $tour->program);
        $this->assertStringNotContainsString('script', $tour->program);
        $this->assertMatchesRegularExpression('~<img src="/storage/\d+/terkep\.jpg" alt="Térkép" loading="lazy">~', $tour->program);
        $this->assertMatchesRegularExpression('~^/storage/\d+/111000122345\.jpg$~', $tour->slider_image);
        $this->assertMatchesRegularExpression('~^/storage/\d+/svajc\.pdf$~', $tour->program_pdf_path);

        // The original JSON is kept word for word, its script included.
        $record = LegacyImportRecord::query()->where('legacy_id', 10)->firstOrFail();
        $this->assertSame(LegacyImportRecord::IMPORTED, $record->status);
        $this->assertSame($tour->id, $record->local_id);
        $this->assertStringContainsString('<script>alert(1)</script>', $record->payload()['program_html']);

        $dates = $tour->dates()->with('extras')->orderBy('start_date')->get();
        $this->assertSame([9001, 12446, 12447, 12448], $dates->pluck('legacy_id')->all());

        [$departed, $first, $second] = $dates;
        $this->assertSame(TourDateStatus::SOLD_OUT, $departed->status);
        $this->assertSame(0, $departed->price_box_available_seats);
        $this->assertEquals(229900, $first->price);
        $this->assertEquals(238400, $first->price_box_original_price);
        $this->assertSame('Előfoglalási akció', $first->price_box_label);
        $this->assertSame(45, $first->price_box_available_seats);
        $this->assertNull($first->accommodation);
        $this->assertSame('Hotel****', $second->accommodation);
        $this->assertSame('Medencés', $second->accommodation_info);
        $this->assertSame(238400, $first->legacy_attributes['price']);
        $this->assertSame('6800', $first->legacy_attributes['resort_fee']);

        $this->assertSame(
            [
                ['Egyágyas felár', 'HUF', TourExtraPriceUnit::PER_PERSON, TourExtraChargeRule::SOLO_TRAVELLER],
                ['Vacsora', 'HUF', TourExtraPriceUnit::PER_BOOKING, TourExtraChargeRule::OPTIONAL],
                ['Városbelépési díj', 'EUR', TourExtraPriceUnit::PER_PERSON, TourExtraChargeRule::MANDATORY],
                ['Üdülőhelyi illeték', 'HUF', TourExtraPriceUnit::PER_PERSON, TourExtraChargeRule::MANDATORY],
                ['Üdülőhelyi illeték', 'EUR', TourExtraPriceUnit::PER_PERSON, TourExtraChargeRule::MANDATORY],
            ],
            $first->extras->map(fn ($extra): array => [$extra->name, $extra->currency, $extra->price_unit, $extra->charge_rule])->all(),
        );

        // Two places on the tour; the date offering only one of them says so.
        $places = TourDeparturePlace::query()->orderBy('legacy_id')->get();
        $this->assertSame([212, 213], $places->pluck('legacy_id')->all());
        $this->assertEqualsCanonicalizing($places->pluck('id')->all(), $tour->departurePlaces->pluck('id')->all());
        $this->assertEquals(2500, $tour->departurePlaces->firstWhere('legacy_id', 212)->pivot->fee);
        $this->assertNull($first->departure_place_ids);
        $this->assertSame([$places->firstWhere('legacy_id', 213)->id], $second->departure_place_ids);

        // The main gallery in its legacy order, the intro gallery kept apart
        // and the program gallery (the main one again) not duplicated.
        $this->assertSame([501, 502, 503], $tour->galleryItems()->pluck('legacy_image_id')->all());
        $this->assertSame([601], $tour->galleryCollection(TourGalleryItem::INTRO)->pluck('legacy_image_id')->all());
        $this->assertSame(0, $tour->galleryCollection(TourGalleryItem::PROGRAM)->count());

        $this->assertSame([['Alap bónuszok: 1–10 fő', '0 ajándék hely']], $tour->partnerBonuses()->get()->map(fn ($bonus): array => [$bonus->label, $bonus->value])->all());
        $this->assertSame(0, $tour->programDays()->count());
    }

    public function test_statuses_follow_the_legacy_offers_and_an_expired_tour_keeps_its_original_status(): void
    {
        $this->importCatalog();

        $inactive = Tour::query()->where('legacy_id', 20)->firstOrFail();
        $this->assertFalse($inactive->active);
        $this->assertFalse($inactive->legacy_attributes['legacy_active']);

        // Active in the legacy admin, but every date departed: switched off
        // as expired, its original status still on record.
        $expired = Tour::query()->where('legacy_id', 30)->firstOrFail();
        $this->assertFalse($expired->active);
        $this->assertNotNull($expired->expired_at);
        $this->assertTrue($expired->legacy_attributes['legacy_active']);
        $this->assertSame(TourDateStatus::CANCELLED, $expired->dates()->where('legacy_id', 14001)->value('status'));

        $test = Tour::withTrashed()->where('legacy_id', 1155)->firstOrFail();
        $this->assertTrue($test->trashed());
        $this->assertFalse($test->active);

        $this->assertSame(LegacyImportRecord::FAILED, LegacyImportRecord::query()->where('legacy_id', 40)->value('status'));
        $this->assertSame(0, Tour::withTrashed()->where('legacy_id', 40)->count());
    }

    public function test_an_existing_tour_is_taken_over_in_place_so_its_bookings_keep_their_tour_and_dates(): void
    {
        $tour = Tour::factory()->create(['seo_name' => 'del-csehorszag-gazdagon-', 'name' => 'Régi név', 'active' => false, 'search_keywords' => ['Krumlov']]);
        $tour->forceFill(['expired_at' => now()->subWeek()])->save();
        $tour->delete();
        $sameDays = TourDate::factory()->for($tour)->create(['start_date' => '2025-05-01', 'end_date' => '2025-05-04', 'price' => 89900]);
        $bookedElsewhere = TourDate::factory()->for($tour)->create(['start_date' => '2026-12-01', 'end_date' => '2026-12-04']);
        $unbooked = TourDate::factory()->for($tour)->create(['start_date' => '2026-12-10', 'end_date' => '2026-12-13']);
        $first = Booking::factory()->create(['tour_id' => $tour->id, 'tour_date_id' => $sameDays->id]);
        $second = Booking::factory()->create(['tour_id' => $tour->id, 'tour_date_id' => $bookedElsewhere->id]);

        $this->importCatalog();

        $tour->refresh();
        $this->assertSame(20, $tour->legacy_id);
        // Archived before, inactive in the legacy admin: back on the site's
        // list, switched off, and no longer counted as expired.
        $this->assertFalse($tour->trashed());
        $this->assertFalse($tour->active);
        $this->assertNull($tour->expired_at);
        $this->assertSame('Dél-Csehország gazdagon', $tour->name);
        $this->assertSame(['Krumlov'], $tour->search_keywords);
        $this->assertSame($tour->id, $first->fresh()->tour_id);
        $this->assertSame($sameDays->id, $first->fresh()->tour_date_id);
        $this->assertSame(13001, $sameDays->fresh()->legacy_id);
        $this->assertEquals(99900, $sameDays->fresh()->price);
        // A date the legacy offer lacks stays while a booking points at it.
        $this->assertFalse($bookedElsewhere->fresh()->trashed());
        $this->assertSame($bookedElsewhere->id, $second->fresh()->tour_date_id);
        $this->assertTrue(TourDate::withTrashed()->findOrFail($unbooked->id)->trashed());
        $this->assertSame(1, Tour::withTrashed()->where('seo_name', 'del-csehorszag-gazdagon-')->count());
    }

    public function test_a_tour_no_offer_takes_over_is_archived_or_with_bookings_only_switched_off(): void
    {
        $unbooked = Tour::factory()->create(['seo_name' => 'nincs-a-regi-adminban', 'active' => true]);
        $booked = Tour::factory()->create(['seo_name' => 'foglalt-de-nincs-a-regi-adminban', 'active' => true]);
        Booking::factory()->create(['tour_id' => $booked->id]);

        $this->importCatalog();

        $this->assertTrue(Tour::withTrashed()->findOrFail($unbooked->id)->trashed());
        $this->assertFalse($booked->fresh()->trashed());
        $this->assertFalse($booked->fresh()->active);
    }

    public function test_running_the_import_again_changes_and_duplicates_nothing(): void
    {
        $this->importCatalog();
        $counts = $this->counts();

        $this->artisan('adria:catalog:import', ['file' => self::CATALOG])->expectsOutputToContain('[SKIPPED] 10 unchanged');
        $this->assertSame($counts, $this->counts());

        $this->artisan('adria:catalog:import', ['file' => self::CATALOG, '--reimport-unchanged' => true])->expectsOutputToContain('[UPDATE] 10');
        $this->assertSame($counts, $this->counts());
    }

    public function test_only_upcoming_imported_dates_can_be_booked(): void
    {
        $this->importCatalog();
        $tour = Tour::query()->where('legacy_id', 10)->firstOrFail();
        $payload = fn (TourDate $date): array => [
            'termsAccepted' => true,
            'tourId' => $tour->id,
            'tourDateId' => $date->id,
            'departurePlaceId' => $tour->departurePlaces->first()->id,
            'formData' => [
                'contact_name' => 'Kovács Anna',
                'contact_email' => 'anna@example.com',
                'contact_phone' => '+36301234567',
                'contact_postal_code' => '1051',
                'contact_city' => 'Budapest',
                'contact_address' => 'Fő utca 1.',
            ],
            'passengers' => [['passenger_name' => 'Utas 1', 'passenger_birth_date' => '1990-01-01'], ['passenger_name' => 'Utas 2', 'passenger_birth_date' => '1990-01-01']],
        ];

        $this->postJson('/api/bookings', $payload($tour->dates()->where('legacy_id', 9001)->firstOrFail()))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['tour_date_id']);

        $response = $this->postJson('/api/bookings', $payload($tour->dates()->where('legacy_id', 12446)->firstOrFail()))->assertCreated();
        $pricing = Booking::query()->findOrFail($response->json('id'))->payload['pricing'];
        // 2 × 229 900 + 2 × 6 800 resort fee; the euro fees are paid on site.
        $this->assertEquals(473400, $pricing['total']);
        $this->assertSame(['Városbelépési díj', 'Üdülőhelyi illeték'], array_column($pricing['onSiteExtras'], 'name'));
    }

    public function test_media_are_mirrored_once_and_a_missing_file_is_recorded_not_lost(): void
    {
        $missing = 'https://adriaholiday.hu/uploads/gallery/77/503.jpg';
        $this->missingLegacyImages = [$missing];

        $this->artisan('adria:catalog:media', ['file' => self::CATALOG])
            ->expectsOutputToContain($missing)
            ->assertFailed();
        $this->artisan('adria:catalog:import', ['file' => self::CATALOG]);

        $this->assertSame(LegacyMediaFile::FAILED, LegacyMediaFile::query()->forUrl($missing)->value('status'));
        $this->assertSame(6, LegacyMediaFile::query()->where('status', LegacyMediaFile::MIRRORED)->count());
        $tour = Tour::query()->where('legacy_id', 10)->firstOrFail();
        $this->assertSame([501, 502], $tour->galleryItems()->pluck('legacy_image_id')->all());
        $this->assertContains("Gallery image not mirrored: {$missing}", LegacyImportRecord::query()->where('legacy_id', 10)->firstOrFail()->messages);

        // Mirroring again downloads only what is still missing.
        $this->missingLegacyImages = [];
        $this->artisan('adria:catalog:media', ['file' => self::CATALOG])->assertSuccessful();
        $this->assertSame(7, LegacyMediaFile::query()->where('status', LegacyMediaFile::MIRRORED)->count());
    }

    public function test_verification_passes_after_the_import_and_catches_a_difference(): void
    {
        $this->importCatalog();

        $this->artisan('adria:catalog:verify', ['file' => self::CATALOG])->assertSuccessful();

        TourDate::query()->where('legacy_id', 12446)->update(['price' => 1]);

        $this->artisan('adria:catalog:verify', ['file' => self::CATALOG])
            ->expectsOutputToContain('date 12446 (2027-07-16) differs: price.')
            ->assertFailed();
    }

    public function test_an_imported_tour_is_saved_unchanged_from_the_admin_and_shown_on_the_public_site(): void
    {
        $this->importCatalog();
        $tour = Tour::query()->where('legacy_id', 10)->firstOrFail();
        $this->actingAsTourEditor();

        // The admin form loads the tour and sends it back as it is.
        $this->patchJson("/api/admin/tours/{$tour->id}", $this->adminDetail($tour))->assertOk();

        $first = $tour->dates()->where('legacy_id', 12446)->firstOrFail();
        $this->assertSame(['HUF', 'HUF', 'EUR', 'HUF', 'EUR'], $first->extras()->pluck('currency')->all());
        $this->assertSame('Hotel****', $tour->dates()->where('legacy_id', 12447)->value('accommodation'));
        $this->assertSame([9001, 12446, 12447, 12448], $tour->dates()->orderBy('start_date')->pluck('legacy_id')->all());
        $this->assertSame(1, $tour->galleryCollection(TourGalleryItem::INTRO)->count());
        $this->assertSame(3, $tour->galleryItems()->count());
        $this->assertSame('<p>A program változhat.</p>', $tour->fresh()->program_footer);

        // The public offer page: upcoming dates only, extras with their currency.
        $offer = $this->getJson('/api/portfolio/offers/svajc---a-hofodte-alpoktol')->assertOk()->json();
        $this->assertSame(['2027-07-16', '2027-08-20', '2027-09-10'], array_column($offer['dates'], 'startDate'));
        $this->assertSame('EUR', collect($offer['dates'][0]['extras'])->firstWhere('name', 'Városbelépési díj')['currency']);
        $this->assertCount(3, $offer['gallery']);
        // The header image is the gallery's first: the legacy slider image does not replace it.
        $this->assertSame($tour->galleryItems()->first()->media_id, $offer['image']['id']);

        // Inactive and archived offers stay off the public site.
        $this->getJson('/api/portfolio/offers/del-csehorszag-gazdagon-')->assertNotFound();
        $this->getJson('/api/portfolio/offers/a:b')->assertNotFound();
    }

    public function test_the_admin_edits_the_imported_seo_footer_and_date_stay_and_an_older_form_keeps_them(): void
    {
        $this->importCatalog();
        $tour = Tour::query()->where('legacy_id', 10)->firstOrFail();
        $this->actingAsTourEditor();
        $detail = $this->adminDetail($tour);

        $this->assertSame('Svájci körutazás', $detail['seoTitle']);
        $this->assertSame('index, follow', $detail['seoRobots']);
        $this->assertSame('<p>A program változhat.</p>', $detail['programFooter']);
        $this->assertSame('Hotel****', collect($detail['dates'])->firstWhere('startDate', '2027-08-20')['accommodation']);

        $detail['seoTitle'] = 'Svájc körutazás busszal';
        $detail['seoRobots'] = 'noindex, follow';
        $detail['programFooter'] = '<p>A programváltozás jogát fenntartjuk.</p><script>x()</script>';
        $detail['dates'] = array_map(fn (array $date): array => $date['startDate'] === '2027-09-10'
            ? [...$date, 'catering' => 'félpanzió', 'cateringInfo' => 'Vacsora a szállodában']
            : $date, $detail['dates']);
        $this->patchJson("/api/admin/tours/{$tour->id}", $detail)->assertOk();

        $tour->refresh();
        $this->assertSame('Svájc körutazás busszal', $tour->seo_title);
        $this->assertSame('noindex, follow', $tour->seo_robots);
        $this->assertSame('<p>A programváltozás jogát fenntartjuk.</p>', $tour->program_footer);
        $this->assertSame('félpanzió', $tour->dates()->where('legacy_id', 12448)->value('catering'));

        // A form that does not know the new fields leaves them as they are.
        $older = collect($this->adminDetail($tour))->except(['seoTitle', 'seoDescription', 'seoRobots', 'programFooter'])->all();
        $older['dates'] = array_map(fn (array $date): array => collect($date)->except(['accommodation', 'accommodationInfo', 'catering', 'cateringInfo'])->all(), $older['dates']);
        $this->patchJson("/api/admin/tours/{$tour->id}", $older)->assertOk();

        $tour->refresh();
        $this->assertSame('Svájc körutazás busszal', $tour->seo_title);
        $this->assertSame('<p>A programváltozás jogát fenntartjuk.</p>', $tour->program_footer);
        $this->assertSame('Hotel****', $tour->dates()->where('legacy_id', 12447)->value('accommodation'));
        $this->assertSame('félpanzió', $tour->dates()->where('legacy_id', 12448)->value('catering'));
        $this->assertSame(['HUF', 'HUF', 'EUR', 'HUF', 'EUR'], $tour->dates()->where('legacy_id', 12446)->firstOrFail()->extras()->pluck('currency')->all());
        $this->assertSame(10, $tour->legacy_id);
        $this->assertSame('10!8!3', $tour->legacy_attributes['admin_list_row']['order']);
        $this->assertSame(1, $tour->galleryCollection(TourGalleryItem::INTRO)->count());
    }

    public function test_the_public_offer_shows_the_footer_and_the_stay_of_each_departure(): void
    {
        $this->importCatalog();

        $offer = $this->getJson('/api/portfolio/offers/svajc---a-hofodte-alpoktol')->assertOk()->json();
        $dates = collect($offer['dates'])->keyBy('startDate');

        $this->assertSame('<p>A program változhat.</p>', $offer['programFooter']);
        $this->assertNull($offer['robots']);
        $this->assertSame('Hotel***', $offer['accommodation']);
        $this->assertNull($dates['2027-07-16']['accommodation']);
        $this->assertSame('Hotel****', $dates['2027-08-20']['accommodation']);
        $this->assertSame('Medencés', $dates['2027-08-20']['accommodationInfo']);
        $this->assertEquals(229900, $dates['2027-07-16']['priceBox']['price']);
        $this->assertSame(45, $dates['2027-07-16']['priceBox']['availableSeats']);
    }

    public function test_an_imported_tour_can_be_duplicated_into_a_tour_of_the_site(): void
    {
        $this->importCatalog();
        $tour = Tour::query()->where('legacy_id', 10)->firstOrFail();
        $this->actingAsTourEditor();

        $copyId = $this->postJson("/api/admin/tours/{$tour->id}/duplicate")->assertSuccessful()->json('data.id');

        $copy = Tour::query()->findOrFail($copyId);
        $this->assertNull($copy->legacy_id);
        $this->assertNull($copy->legacy_attributes);
        $this->assertSame('<p>A program változhat.</p>', $copy->program_footer);
        $this->assertSame('Hotel****', $copy->dates()->whereDate('start_date', '2027-08-20')->value('accommodation'));
        $this->assertContains('EUR', $copy->dates()->whereDate('start_date', '2027-07-16')->firstOrFail()->extras()->pluck('currency')->all());
        $this->assertEquals(238400, $copy->dates()->whereDate('start_date', '2027-07-16')->value('price_box_original_price'));
    }

    public function test_an_unlisted_offer_stays_on_its_own_page_but_off_every_list(): void
    {
        config(['legacy_catalog.unlisted_legacy_ids' => [10]]);
        $this->importCatalog();
        $tour = Tour::query()->where('legacy_id', 10)->firstOrFail();
        $tour->update(['featured' => true]);

        $this->assertFalse($tour->listed);
        $this->getJson('/api/portfolio/offers/svajc---a-hofodte-alpoktol')->assertOk();
        $this->assertNotContains('svajc---a-hofodte-alpoktol', array_column($this->getJson('/api/portfolio/offers?perPage=100')->assertOk()->json('items'), 'seoName'));
        $this->assertSame([], $this->getJson('/api/portfolio/featured-tours')->assertOk()->json('items'));

        // The admin lists it again; a form that does not send the flag leaves it.
        $this->actingAsTourEditor();
        $this->patchJson("/api/admin/tours/{$tour->id}", [...$this->adminDetail($tour), 'listed' => true])->assertOk();
        $this->assertTrue($tour->fresh()->listed);
        $this->patchJson("/api/admin/tours/{$tour->id}", collect($this->adminDetail($tour))->except('listed')->all())->assertOk();
        $this->assertTrue($tour->fresh()->listed);
        $this->assertContains('svajc---a-hofodte-alpoktol', array_column($this->getJson('/api/portfolio/offers?perPage=100')->json('items'), 'seoName'));
    }

    /**
     * The tour as the admin form loads it (gallery item ids kept as strings).
     *
     * @return array<string, mixed>
     */
    private function adminDetail(Tour $tour): array
    {
        $detail = $this->getJson("/api/admin/tours/{$tour->id}")->assertOk()->json('data');
        $detail['gallery'] = array_map(fn (array $item): array => [...$item, 'id' => (string) $item['id']], $detail['gallery']);

        return $detail;
    }

    private function actingAsTourEditor(): void
    {
        $permissions = ['tours.viewAny', 'tours.view', 'tours.update', 'tours.duplicate'];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Catalog Test Editor', 'web');
        $role->syncPermissions($permissions);
        $user = User::factory()->create();
        $user->assignRole($role);

        Sanctum::actingAs($user);
    }

    private function importCatalog(): PendingCommand
    {
        $this->artisan('adria:catalog:media', ['file' => self::CATALOG])->assertSuccessful();

        return $this->artisan('adria:catalog:import', ['file' => self::CATALOG]);
    }

    /**
     * @return array<string, int>
     */
    private function counts(): array
    {
        return [
            'tours' => Tour::withTrashed()->count(),
            'dates' => TourDate::withTrashed()->count(),
            'extras' => TourDateExtra::query()->count(),
            'places' => TourDeparturePlace::query()->count(),
            'gallery' => TourGalleryItem::query()->count(),
            'media' => Media::query()->count(),
            'records' => LegacyImportRecord::query()->count(),
        ];
    }
}
