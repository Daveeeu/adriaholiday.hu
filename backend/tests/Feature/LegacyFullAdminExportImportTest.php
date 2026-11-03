<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\Booking;
use App\Models\Bus;
use App\Models\ContactMessage;
use App\Models\Coupon;
use App\Models\Customer;
use App\Models\HomepageOffer;
use App\Models\LegacyImportRecord;
use App\Models\LegacyImportRun;
use App\Models\Page;
use App\Models\PartnerFinanceRecord;
use App\Models\SeoRedirect;
use App\Models\Testimonial;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDeparturePlace;
use App\Models\TourRegionGroup;
use App\Models\TourSeasonalGroup;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LegacyFullAdminExportImportTest extends TestCase
{
    use RefreshDatabase;

    private const FIXTURE = __DIR__.'/../Fixtures/legacy-admin-export/export.json';

    public function test_a_dry_run_reports_without_writing_anything(): void
    {
        $this->artisan('adria:legacy:import', ['file' => self::FIXTURE, '--dry-run' => true])->assertSuccessful();

        $this->assertSame(0, Customer::query()->count());
        $this->assertSame(0, Booking::query()->count());
        $this->assertSame(0, SeoRedirect::query()->count());
        $this->assertSame(0, LegacyImportRun::query()->count());
    }

    public function test_every_entity_of_the_export_is_imported_onto_what_it_refers_to(): void
    {
        $tour = Tour::factory()->create(['legacy_id' => 113, 'name' => 'Reneszánsz advent Toszkánában']);
        $date = TourDate::factory()->for($tour)->create(['legacy_id' => 236, 'start_date' => '2026-12-03', 'end_date' => '2026-12-06']);
        $inquiryTour = Tour::factory()->create(['legacy_id' => 12]);
        $apartment = Apartment::factory()->create(['legacy_id' => 125]);

        $this->import();

        $customer = Customer::query()->sole();
        $this->assertSame('pocsaine.erzsi@example.com', $customer->email);
        $this->assertSame('136431', $customer->referral_code);
        $this->assertSame(10000, $customer->registration_coupon_value);
        $this->assertSame('2016-05-02', $customer->registered_at->toDateString());

        $this->assertTrue(Coupon::query()->where('code', '35179c0660')->where('value', 5000)->whereDate('expires_at', '2024-12-31')->exists());
        $this->assertSame("Üdv!\n\nSzép kártyával lehet fizetni?\n\nKöszönettel: Nagy Attila", ContactMessage::query()->sole()->message);

        $booking = Booking::query()->where('booking_type', 'tour_booking')->sole();
        $this->assertSame($tour->id, $booking->tour_id);
        $this->assertSame($date->id, $booking->tour_date_id);
        $this->assertSame('Ren-8907', $booking->offer_code);
        $this->assertSame('dunaújvárosi indulással', $booking->payload['legacy']['departure']);

        $inquiry = Booking::query()->where('booking_type', 'tour_inquiry')->sole();
        $this->assertSame($inquiryTour->id, $inquiry->tour_id);
        $this->assertSame(24, $inquiry->passenger_count);
        $this->assertSame('contacted', $inquiry->status);

        $apartmentBooking = Booking::query()->where('booking_type', 'apartment_booking')->sole();
        $this->assertSame($apartment->id, $apartmentBooking->apartment_id);
        $this->assertSame('B-4', $apartmentBooking->payload['apartmentType']);
        $this->assertSame(['Gyabronka István', 'Gyabronka Léna'], array_column($apartmentBooking->payload['passengers'], 'name'));
        $this->assertSame('2026-08-02', $apartmentBooking->check_in->toDateString());

        $this->assertSame(2500, (int) TourDeparturePlace::query()->where('legacy_id', 51)->value('fee'));
        $this->assertFalse(TourRegionGroup::query()->where('seo_name', 'svajc')->sole()->active);
        $this->assertTrue(TourSeasonalGroup::query()->where('seo_name', 'korutazas')->exists());
        $this->assertSame('NZB-791', Bus::query()->sole()->vehicle_code);

        $offer = HomepageOffer::query()->sole();
        $this->assertFalse($offer->active);
        $this->assertSame('/korutazasok/csoport/osztalykirandulasok/hatartalanul', $offer->link);

        $page = Page::query()->where('kind', Page::KIND_PAGE)->sole();
        $this->assertSame('autobuszaink', $page->slug);
        $this->assertFalse($page->active);
        $this->assertStringNotContainsString('<script', (string) $page->content);
        $this->assertNull(Page::query()->where('kind', Page::KIND_TEXT_BLOCK)->sole()->slug);

        $this->assertSame('K Ágnes', Testimonial::query()->sole()->author);
        $this->assertSame(2, PartnerFinanceRecord::query()->count());

        $this->assertSame(
            ['apartman/villa-damiana---žminj' => '/korutazasok/regio/horvatorszag', 'buszaink' => '/autobuszaink'],
            SeoRedirect::query()->orderBy('source_path')->pluck('target', 'source_path')->all(),
        );
        // The tour and apartment steps record their own runs, like their own commands do.
        $this->assertSame([LegacyImportRun::COMPLETED], LegacyImportRun::query()->distinct()->pluck('status')->all());
    }

    public function test_a_re_run_skips_what_did_not_change_and_updates_what_did(): void
    {
        $this->import();
        $counts = [Customer::query()->count(), Booking::query()->count(), Page::query()->count(), SeoRedirect::query()->count()];

        $this->import();

        $this->assertSame($counts, [Customer::query()->count(), Booking::query()->count(), Page::query()->count(), SeoRedirect::query()->count()]);

        $changed = json_decode((string) file_get_contents(self::FIXTURE), true);
        $changed['entities']['users.user']['records'][1]['fields']['user_data']['phone'] = '06701112233';
        $path = tempnam(sys_get_temp_dir(), 'legacy-export');
        file_put_contents($path, json_encode($changed));

        $this->artisan('adria:legacy:import', ['file' => $path, '--only' => ['customers'], '--force' => true, '--media' => 'none'])->assertSuccessful();
        unlink($path);

        $this->assertSame('06701112233', Customer::query()->sole()->phone);
        $this->assertSame(1, LegacyImportRecord::query()->where('entity', LegacyImportRecord::CUSTOMER)->count());
    }

    public function test_records_the_office_already_made_keep_their_own_values(): void
    {
        $group = TourRegionGroup::factory()->create(['seo_name' => 'svajc', 'name' => 'Svájc', 'description' => '<p>Saját leírás</p>', 'active' => true]);
        SeoRedirect::factory()->create(['source_path' => 'buszaink', 'target' => '/rolunk']);

        $this->import();

        $this->assertSame('<p>Saját leírás</p>', $group->refresh()->description);
        $this->assertTrue($group->active);
        $this->assertSame('/rolunk', SeoRedirect::query()->where('source_path', 'buszaink')->value('target'));
    }

    public function test_an_unknown_step_is_refused(): void
    {
        $this->artisan('adria:legacy:import', ['file' => self::FIXTURE, '--only' => ['nope'], '--dry-run' => true])->assertFailed();
    }

    private function import(): void
    {
        $this->artisan('adria:legacy:import', ['file' => self::FIXTURE, '--force' => true, '--media' => 'none'])->assertSuccessful();
    }
}
