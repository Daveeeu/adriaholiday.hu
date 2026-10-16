<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\ApartmentGalleryItem;
use App\Models\ApartmentType;
use App\Models\Booking;
use App\Models\LegacyImportRecord;
use App\Models\Location;
use App\Models\Region;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\PendingCommand;
use Tests\Concerns\FakesLegacyImages;
use Tests\TestCase;

class LegacyApartmentImportTest extends TestCase
{
    use FakesLegacyImages, RefreshDatabase;

    private const EXPORT = __DIR__.'/../Fixtures/legacy-apartments/apartments.json';

    private Location $bibione;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo('2026-10-16 12:00:00');
        // Reports go to the private disk; never onto the real one.
        Storage::fake('local');
        config(['services.legacy_adria.request_delay_ms' => 0]);
        $this->fakeLegacyImages();

        $italy = Region::factory()->create(['slug' => 'italy', 'name' => 'Olaszország']);
        Region::factory()->create(['slug' => 'greece', 'name' => 'Görögország']);
        $this->bibione = Location::factory()->for($italy)->create(['slug' => 'bibione', 'name' => 'Bibione', 'description' => 'Régi leírás']);
        Location::factory()->for($italy)->create(['slug' => 'lignano', 'name' => 'Lignano']);
    }

    public function test_a_dry_run_writes_nothing_but_its_report(): void
    {
        $this->import(['--dry-run' => true])->assertSuccessful();

        $this->assertSame(0, Apartment::withTrashed()->count());
        $this->assertSame(0, LegacyImportRecord::query()->count());
        $this->assertSame(2, Location::query()->count());

        $report = $this->latestReport();
        $this->assertSame(['create' => 5], $report['summary']['by_action']);
        $this->assertSame(1, $report['summary']['listed']);
    }

    public function test_the_listed_apartment_is_published_with_its_data_and_the_others_are_imported_inactive(): void
    {
        $this->import(['--media' => 'none'])->assertSuccessful();

        $apartment = Apartment::query()->where('legacy_id', 17)->firstOrFail();

        $this->assertTrue($apartment->is_active);
        $this->assertSame(Apartment::STATUS_PUBLISHED, $apartment->status);
        $this->assertSame('3c-apartman-(42)-bibione', $apartment->slug);
        $this->assertSame('3c-apartman-(42)-bibione', $apartment->seo_name);
        $this->assertSame('3C Apartman (42) Bibione', $apartment->name);
        $this->assertSame('42', $apartment->code);
        $this->assertSame('italian', $apartment->type);
        $this->assertSame(3, $apartment->stars);
        $this->assertSame(50, $apartment->distance_to_center_m);
        $this->assertSame(300, $apartment->distance_to_sea_m);
        $this->assertSame(6, $apartment->max_guests);
        $this->assertSame('45.6349030', (string) $apartment->latitude);
        $this->assertSame('Árak 2027 Apartman/éj Euro-ban', $apartment->price_header);
        $this->assertSame(['fürdőszoba_zuhanyzóval', 'legkondicionalo', 'szabadtéri_medence'], $apartment->services);
        $this->assertSame($this->bibione->id, $apartment->location_id);
        $this->assertSame($this->bibione->region_id, $apartment->region_id);
        // Legacy links to the legacy site's own pages become site-relative.
        $this->assertStringContainsString('href="/kapcsolat"', (string) $apartment->description);
        $this->assertSame($apartment->description, $apartment->short_description);
        $this->assertStringContainsString('Típus B-5', (string) $apartment->apartment_type_content);

        // Periods in date order; the type list row without beds or prices is left out.
        $this->assertSame(['2026-05-23', '2027-07-03', '2027-07-10'], array_column($apartment->pricing_matrix['columns'], 'startDate'));
        $this->assertSame(['B-5', 'C-6'], array_column($apartment->pricing_matrix['rows'], 'category'));
        $this->assertSame(['80', '106', '111'], $apartment->pricing_matrix['rows'][0]['prices']);

        $this->assertFalse(Apartment::query()->where('legacy_id', 1679)->firstOrFail()->is_active);
        $this->assertSame(Apartment::STATUS_DRAFT, Apartment::query()->where('legacy_id', 7)->firstOrFail()->status);
        $this->assertSame(5, LegacyImportRecord::query()->where('entity', LegacyImportRecord::APARTMENT)->where('status', LegacyImportRecord::IMPORTED)->count());
        $this->assertSame(['italian', 'greek', 'bulgarian', 'montenegro'], ApartmentType::query()->orderBy('id')->pluck('slug')->all());
    }

    public function test_places_map_onto_locations_and_a_location_takes_over_its_legacy_page(): void
    {
        $this->import(['--media' => 'none'])->assertSuccessful();

        $bibione = $this->bibione->refresh();
        $this->assertSame(405, $bibione->legacy_id);
        $this->assertSame('veneto', $bibione->area_slug);
        $this->assertSame('Veneto', $bibione->area_name);
        $this->assertStringContainsString('leglátogatottabb', (string) $bibione->description);
        // The guide's table of contents keeps working: the link stays on the page, its target keeps its id.
        $this->assertStringContainsString('href="/apartmanok/veneto/bibione#strand_bibione"', (string) $bibione->guide);
        $this->assertStringContainsString('id="strand_bibione"', (string) $bibione->guide);
        $this->assertStringContainsString('apartman/éj értendőek', (string) $bibione->apartment_information);
        $this->assertSame('Bibione apartman', $bibione->seo_title);

        $lignano = Location::query()->where('slug', 'lignano')->firstOrFail();
        // A Lignano beach place belongs to Lignano; an apartment without a place uses the configured one.
        $this->assertSame($lignano->id, Apartment::query()->where('legacy_id', 7)->value('location_id'));
        $this->assertSame($lignano->id, Apartment::query()->where('legacy_id', 5071)->value('location_id'));
        $this->assertSame(404, $lignano->legacy_id);

        $neiPori = Location::query()->where('slug', 'nei-pori')->firstOrFail();
        $this->assertSame('greece', $neiPori->region->slug);
        $this->assertSame('olympos-riviera', $neiPori->area_slug);
        $this->assertSame($neiPori->id, Apartment::query()->where('legacy_id', 319)->value('location_id'));
        $this->assertSame('greek', Apartment::query()->where('legacy_id', 319)->value('type'));
    }

    public function test_the_gallery_of_a_listed_apartment_is_copied_cover_first(): void
    {
        $this->import()->assertSuccessful();

        $apartment = Apartment::query()->where('legacy_id', 17)->firstOrFail();
        $items = $apartment->galleryItems()->with('media')->get();

        $this->assertSame([30099, 30095], $items->pluck('legacy_image_id')->all());
        $this->assertSame([0, 1], $items->pluck('sort_order')->all());
        $this->assertTrue($items->every(fn (ApartmentGalleryItem $item): bool => $item->media !== null));
        // An inactive apartment keeps its images in its import record until a run copies them.
        $this->assertSame(0, ApartmentGalleryItem::query()->where('apartment_id', Apartment::query()->where('legacy_id', 7)->value('id'))->count());

        $this->import(['--media' => 'all'])->assertSuccessful();
        $this->assertSame(1, ApartmentGalleryItem::query()->where('apartment_id', Apartment::query()->where('legacy_id', 7)->value('id'))->count());
    }

    public function test_a_rerun_updates_the_same_apartments_and_keeps_edits_of_other_fields(): void
    {
        $this->import()->assertSuccessful();
        $apartment = Apartment::query()->where('legacy_id', 17)->firstOrFail();
        $apartment->update(['bedrooms' => 2]);

        $this->import()->assertSuccessful();

        $this->assertSame(5, Apartment::query()->count());
        $this->assertSame(2, ApartmentGalleryItem::query()->where('apartment_id', $apartment->id)->count());
        $this->assertSame($apartment->id, Apartment::query()->where('legacy_id', 17)->value('id'));
        $this->assertSame(['update' => 5], $this->latestReport()['summary']['by_action']);
    }

    public function test_an_apartment_deleted_on_the_new_site_is_left_alone(): void
    {
        $this->import(['--media' => 'none'])->assertSuccessful();
        Apartment::query()->where('legacy_id', 7)->firstOrFail()->delete();

        $this->import(['--media' => 'none'])->assertSuccessful();

        $this->assertTrue(Apartment::withTrashed()->where('legacy_id', 7)->firstOrFail()->trashed());
        $this->assertSame(1, $this->latestReport()['summary']['by_action']['skipped_deleted']);
    }

    public function test_an_apartment_whose_url_name_is_taken_is_reported_and_not_imported(): void
    {
        Apartment::factory()->create(['slug' => '3c-apartman-(42)-bibione']);

        $this->import(['--media' => 'none'])->assertSuccessful();

        $this->assertNull(Apartment::query()->where('legacy_id', 17)->first());
        $this->assertSame('conflict', collect($this->latestReport()['apartments'])->firstWhere('legacy_id', 17)['action']);
        $this->assertSame(LegacyImportRecord::FAILED, LegacyImportRecord::query()->where('legacy_id', 17)->value('status'));
    }

    public function test_remove_others_deletes_the_demo_apartments_and_deactivates_a_booked_one(): void
    {
        $demo = Apartment::factory()->create(['is_active' => true, 'status' => Apartment::STATUS_PUBLISHED]);
        $booked = Apartment::factory()->create(['is_active' => true, 'status' => Apartment::STATUS_PUBLISHED]);
        Booking::factory()->create(['booking_type' => 'apartment_booking', 'apartment_id' => $booked->id]);

        $this->import(['--media' => 'none', '--remove-others' => true])->assertSuccessful();

        $this->assertSoftDeleted($demo);
        $this->assertFalse($booked->refresh()->is_active);
        $this->assertSame(Apartment::STATUS_DRAFT, $booked->status);
        $this->assertFalse($booked->trashed());
    }

    /**
     * @param  array<string, mixed>  $options
     */
    private function import(array $options = []): PendingCommand
    {
        return $this->artisan('adria:apartments:import', ['file' => self::EXPORT, '--force' => true, ...$options]);
    }

    /**
     * @return array<string, mixed>
     */
    private function latestReport(): array
    {
        $path = collect(Storage::disk('local')->files('legacy-import'))->filter(fn (string $file): bool => str_ends_with($file, '.json'))->sort()->last();

        return json_decode((string) Storage::disk('local')->get($path), true);
    }
}
