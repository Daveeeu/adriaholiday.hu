<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourDeparturePlace;
use App\Models\TourReferenceOption;
use App\Services\Legacy\LegacyImportOutcome;
use App\Services\Legacy\LegacyTourImporter;
use App\Support\Legacy\LegacyOfferData;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Tests\TestCase;

class LegacyTourImporterIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    private const ONE_PIXEL_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake(config('media-library.disk_name'));
        Http::fake([
            '*' => Http::response(base64_decode(self::ONE_PIXEL_PNG_BASE64), 200, ['Content-Type' => 'image/png']),
        ]);
    }

    private function offerData(): LegacyOfferData
    {
        return new LegacyOfferData(
            sourceUrl: 'https://adriaholiday.hu/korutazasok/albania-makedoniaval-fuszerezve',
            seoName: 'albania-makedoniaval-fuszerezve',
            name: 'Albánia, a Balkán Riviérája',
            subtitle: 'Makedóniával fűszerezve',
            shortDescription: 'Belgrád-Shkoder-Berat-Tirana-Kruja-Durres-Skopje-Ohrid-Vlora',
            galleryImageUrls: [
                'https://adriaholiday.hu/uploads/gallery/16205/photo-1.jpg',
                'https://adriaholiday.hu/uploads/gallery/16205/photo-2.jpg',
            ],
            dates: [
                [
                    'legacy_id' => 12250, 'start_date' => '2026-09-25', 'end_date' => '2026-10-01', 'price' => 269600.0,
                    'transport_code' => 'bus', 'catering' => 'félpanzió', 'accommodation' => 'Hotel***',
                    'extras' => [
                        ['name' => 'Vacsora', 'price' => 12000.0, 'price_unit' => 'per_person', 'charge_rule' => 'optional', 'choices' => []],
                        ['name' => 'Egyágyas felár', 'price' => 45900.0, 'price_unit' => 'per_booking', 'charge_rule' => 'solo_traveller', 'choices' => ['Egyedül', 'Szobatárssal']],
                    ],
                    'discount_badge' => '-10%',
                ],
                [
                    'legacy_id' => 12251, 'start_date' => '2026-10-10', 'end_date' => '2026-10-16', 'price' => 279600.0,
                    'transport_code' => 'bus', 'catering' => 'félpanzió', 'accommodation' => 'Hotel***', 'extras' => [], 'discount_badge' => null,
                ],
            ],
            programDays: [
                ['day_number' => 1, 'title' => 'Belgrád', 'description' => 'Indulás a kora reggeli órákban.'],
                ['day_number' => 2, 'title' => 'Shkoder', 'description' => 'Érkezés Albániába.'],
            ],
            priceItems: [
                ['type' => 'included', 'text' => 'autóbuszközlekedés'],
                ['type' => 'excluded', 'text' => 'belépők'],
            ],
            tags: ['Albánia', 'utazás Belgrád'],
            categories: ['Tengerpartok'],
            countrySlugs: ['albania'],
            travelModeCode: 'bus',
            catering: 'félpanzió',
            accommodation: 'Hotel***',
            departurePlaceNames: ['Miskolc', 'Budapest'],
            departurePlaceFees: ['Budapest' => 4700.0],
            notesHtml: '<p>Útiokmány szükséges.</p>',
            discountsHtml: null,
            price: 269600.0,
        );
    }

    public function test_first_import_creates_the_tour_and_its_related_records(): void
    {
        $importer = app(LegacyTourImporter::class);

        $outcome = $importer->import($this->offerData(), updateExisting: false);

        $this->assertSame(LegacyImportOutcome::Created, $outcome);
        $this->assertSame(1, Tour::query()->count());

        $tour = Tour::query()->where('seo_name', 'albania-makedoniaval-fuszerezve')->firstOrFail();
        $this->assertCount(2, $tour->dates);

        $firstDate = $tour->dates()->with('extras')->orderBy('start_date')->firstOrFail();
        $this->assertEquals(269600, $firstDate->price_box_price);
        $this->assertSame('-10%', $firstDate->price_box_discount_badge);
        $this->assertSame(['Vacsora', 'Egyágyas felár'], $firstDate->extras->pluck('name')->all());
        $this->assertSame('per_booking', $firstDate->extras[1]->price_unit);
        $this->assertSame('solo_traveller', $firstDate->extras[1]->charge_rule);
        $this->assertSame(['Egyedül', 'Szobatárssal'], $firstDate->extras[1]->choices);
        $this->assertTrue($tour->couponable);
        $this->assertEquals(4700, $tour->departurePlaces->firstWhere('name', 'Budapest')->pivot->fee);
        $this->assertNull($tour->departurePlaces->firstWhere('name', 'Miskolc')->pivot->fee);
        $this->assertCount(2, $tour->programDays);
        $this->assertCount(2, $tour->galleryItems);
        $this->assertCount(2, $tour->priceItems);
        $this->assertCount(2, $tour->departurePlaces);
        $this->assertSame(2, Media::query()->count());
    }

    public function test_reimporting_without_update_existing_skips_and_never_duplicates(): void
    {
        $importer = app(LegacyTourImporter::class);
        $data = $this->offerData();

        $importer->import($data, updateExisting: false);
        $outcome = $importer->import($data, updateExisting: false);

        $this->assertSame(LegacyImportOutcome::Skipped, $outcome);
        $this->assertSame(1, Tour::query()->count());
        $this->assertSame(2, Media::query()->count());
    }

    public function test_reimporting_with_update_existing_refreshes_without_duplicating_child_records(): void
    {
        $importer = app(LegacyTourImporter::class);
        $data = $this->offerData();

        $importer->import($data, updateExisting: false);
        $outcome = $importer->import($data, updateExisting: true);

        $this->assertSame(LegacyImportOutcome::Updated, $outcome);
        $this->assertSame(1, Tour::query()->count());

        $tour = Tour::query()->where('seo_name', 'albania-makedoniaval-fuszerezve')->firstOrFail();
        $this->assertCount(2, $tour->dates);
        $this->assertCount(2, $tour->programDays);
        $this->assertCount(2, $tour->galleryItems);
        $this->assertCount(2, $tour->priceItems);
        $this->assertCount(2, $tour->departurePlaces);

        // Same source image URLs -> reused Media rows, not re-downloaded.
        $this->assertSame(2, Media::query()->count());
        $this->assertSame(1, TourDeparturePlace::query()->where('name', 'Miskolc')->count());
        $this->assertSame(1, TourReferenceOption::query()->where('type', 'country')->where('code', 'al')->count());
    }

    public function test_update_without_crawl_context_keeps_countries_region_and_categories(): void
    {
        $importer = app(LegacyTourImporter::class);
        $importer->import($this->offerData(), updateExisting: false);
        $tour = Tour::query()->where('seo_name', 'albania-makedoniaval-fuszerezve')->firstOrFail();
        $countryIds = $tour->country_ids;
        $regionId = $tour->region_id;
        $categoryIds = $tour->category_ids;

        $data = $this->offerData();
        $withoutContext = new LegacyOfferData(...[...get_object_vars($data), 'countrySlugs' => [], 'categories' => []]);
        $importer->import($withoutContext, updateExisting: true);

        $tour->refresh();
        $this->assertSame($countryIds, $tour->country_ids);
        $this->assertSame($regionId, $tour->region_id);
        $this->assertSame($categoryIds, $tour->category_ids);
        $this->assertNotSame([], $tour->country_ids);
        $this->assertSame([(string) BlogCategory::query()->where('seo_name', 'tengerpartok')->value('id')], $tour->category_ids);
    }

    public function test_categories_link_existing_portfolio_categories_and_create_missing_ones(): void
    {
        $existing = BlogCategory::query()->create(['active' => true, 'column' => '1', 'sort_order' => 0, 'seo_name' => 'tengerpartok']);

        $data = $this->offerData();
        app(LegacyTourImporter::class)->import(
            new LegacyOfferData(...[...get_object_vars($data), 'categories' => ['Tengerpartok', 'Adventi barangolások']]),
            updateExisting: false,
        );

        $created = BlogCategory::query()->where('seo_name', 'adventi-barangolasok')->with('translations')->firstOrFail();
        $this->assertSame(
            [(string) $existing->id, (string) $created->id],
            Tour::query()->where('seo_name', 'albania-makedoniaval-fuszerezve')->firstOrFail()->category_ids,
        );
        $this->assertSame('Adventi barangolások', $created->translations->firstWhere('locale', 'hu')?->name);
        $this->assertSame(1, BlogCategory::query()->where('seo_name', 'tengerpartok')->count());
    }

    public function test_update_refreshes_dates_in_place_so_bookings_keep_their_date(): void
    {
        $importer = app(LegacyTourImporter::class);
        $importer->import($this->offerData(), updateExisting: false);
        $tour = Tour::query()->where('seo_name', 'albania-makedoniaval-fuszerezve')->firstOrFail();
        $bookedDate = $tour->dates()->orderBy('start_date')->firstOrFail();
        $bookedDate->update(['status' => 'available', 'price_box_available_seats' => 12]);
        $booking = Booking::factory()->create(['tour_id' => $tour->id, 'tour_date_id' => $bookedDate->id]);

        $data = $this->offerData();
        $repriced = [['price' => 259600.0, 'extras' => []] + $data->dates[0]];
        $importer->import(new LegacyOfferData(...[...get_object_vars($data), 'dates' => $repriced]), updateExisting: true);

        $bookedDate->refresh();
        $this->assertSame([$bookedDate->id], $tour->dates()->pluck('id')->all());
        $this->assertSame($bookedDate->id, $booking->fresh()->tour_date_id);
        $this->assertEquals(259600, $bookedDate->price);
        $this->assertEquals(259600, $bookedDate->price_box_price);
        $this->assertSame('available', $bookedDate->status);
        $this->assertSame(12, $bookedDate->price_box_available_seats);
        $this->assertCount(0, $bookedDate->extras);
    }

    public function test_update_keeps_categories_added_on_the_new_site(): void
    {
        $importer = app(LegacyTourImporter::class);
        $importer->import($this->offerData(), updateExisting: false);
        $tour = Tour::query()->where('seo_name', 'albania-makedoniaval-fuszerezve')->firstOrFail();
        $flights = BlogCategory::firstOrCreateForName('Repülős körutazások');
        $tour->update(['category_ids' => [...$tour->category_ids, (string) $flights->id]]);
        $categoryIds = $tour->category_ids;

        $importer->import($this->offerData(), updateExisting: true);

        $this->assertSame($categoryIds, $tour->fresh()->category_ids);
    }

    public function test_update_of_an_offer_closed_for_booking_keeps_its_booking_options(): void
    {
        $importer = app(LegacyTourImporter::class);
        $importer->import($this->offerData(), updateExisting: false);

        $data = $this->offerData();
        $closedDates = array_map(fn (array $date): array => [...$date, 'legacy_id' => null, 'extras' => null], $data->dates);
        $importer->import(new LegacyOfferData(...[
            ...get_object_vars($data),
            'dates' => $closedDates,
            'travelModeCode' => null,
            'catering' => null,
            'accommodation' => null,
            'departurePlaceNames' => ['Miskolc-Mezőkövesd'],
            'departurePlaceFees' => [],
        ]), updateExisting: true);

        $tour = Tour::query()->where('seo_name', 'albania-makedoniaval-fuszerezve')->firstOrFail();
        $this->assertSame(['Vacsora', 'Egyágyas felár'], $tour->dates()->orderBy('start_date')->firstOrFail()->extras->pluck('name')->all());
        $this->assertEqualsCanonicalizing(['Miskolc', 'Budapest'], $tour->departurePlaces->pluck('name')->all());
        $this->assertSame('bus', $tour->travel_mode_id);
        $this->assertSame('félpanzió', $tour->catering);
        $this->assertSame('Hotel***', $tour->accommodation);
        $this->assertFalse(TourDeparturePlace::query()->where('name', 'Miskolc-Mezőkövesd')->exists());
    }

    public function test_update_keeps_the_extra_order_set_in_the_admin(): void
    {
        $importer = app(LegacyTourImporter::class);
        $importer->import($this->offerData(), updateExisting: false);
        $date = Tour::query()->where('seo_name', 'albania-makedoniaval-fuszerezve')->firstOrFail()
            ->dates()->orderBy('start_date')->firstOrFail();
        $date->extras()->where('name', 'Vacsora')->update(['sort_order' => 2]);
        $date->extras()->where('name', 'Egyágyas felár')->update(['sort_order' => 1]);

        $data = $this->offerData();
        $dates = $data->dates;
        $dates[0]['extras'][] = ['name' => 'Reptéri transzfer', 'price' => 9000.0, 'price_unit' => 'per_person', 'charge_rule' => 'optional', 'choices' => []];
        $importer->import(new LegacyOfferData(...[...get_object_vars($data), 'dates' => $dates]), updateExisting: true);

        $this->assertSame(['Egyágyas felár', 'Vacsora', 'Reptéri transzfer'], $date->fresh()->extras->pluck('name')->all());
    }

    public function test_dates_take_over_the_struck_price_label_and_sold_out_mark(): void
    {
        $importer = app(LegacyTourImporter::class);
        $importer->import($this->offerData(), updateExisting: false);
        $tour = Tour::query()->where('seo_name', 'albania-makedoniaval-fuszerezve')->firstOrFail();
        $tour->dates()->whereDate('start_date', '2026-10-10')->update(['status' => 'available']);

        $data = $this->offerData();
        $dates = $data->dates;
        $dates[0] = [...$dates[0], 'original_price' => 289600.0, 'label' => 'Előfoglalási akció'];
        $dates[1] = [...$dates[1], 'sold_out' => true];
        $importer->import(new LegacyOfferData(...[...get_object_vars($data), 'dates' => $dates]), updateExisting: true);

        $this->getJson('/api/portfolio/offers/albania-makedoniaval-fuszerezve')
            ->assertOk()
            ->assertJsonPath('dates.0.priceBox.originalPrice', 289600)
            ->assertJsonPath('dates.0.priceBox.originalDisplayedPrice', '289 600 Ft')
            ->assertJsonPath('dates.0.priceBox.label', 'Előfoglalási akció')
            ->assertJsonPath('dates.0.status', 'planned')
            ->assertJsonPath('dates.1.status', 'sold_out');
    }

    public function test_a_date_bookable_again_on_the_legacy_site_is_no_longer_sold_out(): void
    {
        $importer = app(LegacyTourImporter::class);
        $data = $this->offerData();
        $soldOut = $data->dates;
        $soldOut[1]['sold_out'] = true;
        $importer->import(new LegacyOfferData(...[...get_object_vars($data), 'dates' => $soldOut]), updateExisting: false);
        $tour = Tour::query()->where('seo_name', 'albania-makedoniaval-fuszerezve')->firstOrFail();
        $this->assertSame('sold_out', $tour->dates()->whereDate('start_date', '2026-10-10')->value('status'));

        $importer->import($data, updateExisting: true);

        $this->assertSame('planned', $tour->dates()->whereDate('start_date', '2026-10-10')->value('status'));
    }

    public function test_the_subtitle_and_legacy_tabs_are_imported(): void
    {
        $data = $this->offerData();
        app(LegacyTourImporter::class)->import(new LegacyOfferData(...[
            ...get_object_vars($data),
            'teaserHtml' => '<p>Van olyan utazás…</p>',
            'ticketsHtml' => '<table><tbody><tr><td>Tower</td><td>25 GBP</td></tr></tbody></table>',
            'optionalProgramsHtml' => '<p>a.) Windsor</p>',
        ]), updateExisting: false);

        $this->getJson('/api/portfolio/offers/albania-makedoniaval-fuszerezve')
            ->assertOk()
            ->assertJsonPath('subtitle', 'Makedóniával fűszerezve')
            ->assertJsonPath('teaser', '<p>Van olyan utazás…</p>')
            ->assertJsonPath('tickets', '<table><tbody><tr><td>Tower</td><td>25 GBP</td></tr></tbody></table>')
            ->assertJsonPath('optionalPrograms', '<p>a.) Windsor</p>');
    }
}
