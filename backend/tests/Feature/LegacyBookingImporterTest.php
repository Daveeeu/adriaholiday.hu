<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourDate;
use App\Support\Booking\TourBookingStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class LegacyBookingImporterTest extends TestCase
{
    use RefreshDatabase;

    private Tour $tour;

    private TourDate $tourDate;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
        $this->tour = Tour::factory()->create(['name' => 'Szlovéniai pillanatok', 'active' => true]);
        $this->tourDate = TourDate::factory()->for($this->tour)->create([
            'start_date' => '2026-10-24',
            'end_date' => '2026-10-25',
            'price_box_available_seats' => 40,
        ]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function record(array $overrides = []): array
    {
        return array_merge([
            'id' => 8830,
            'position' => 'Szl-8830',
            'createdAt' => '2026-10-06 20:39:29',
            'name' => 'Teszt Elek',
            'zip' => '3530',
            'city' => 'Miskolc',
            'street' => 'Fő utca 1.',
            'mobile' => '+36301112233',
            'email' => 'teszt@example.com',
            'message' => 'Ablak mellé kérnénk.',
            'adults' => '2',
            'customDate' => '',
            'description' => '',
            'passengers' => 'Teszt Elek [útiokmány: AB123456, lakcím: 3530, Miskolc, Fő utca 1. , születési dátum: 1980-01-02], Teszt Anna [útiokmány: CD654321, lakcím: 3530, Miskolc, Fő utca 1. , születési dátum: 1982-03-04], ',
            'price' => '170800',
            'canceled' => '0',
            'insurance' => '',
            'cancellation' => '',
            'cancellationZ1' => 'no',
            'insuranceEub' => 'yes',
            'cancellationEub' => 'no',
            'singleAlone' => '0',
            'singleRoommate' => '0',
            'offerId' => '1000',
            'offerName' => 'Szlovéniai pillanatok',
            'offerDateId' => '12089',
            'offerDate' => '2026-10-24 — 2026-10-25',
            'departureId' => '213',
            'departure' => 'Budapest BOK Csarnok',
        ], $overrides);
    }

    private function runImport(array $records, bool $dryRun = false): void
    {
        $path = tempnam(sys_get_temp_dir(), 'legacy-bookings');
        file_put_contents($path, json_encode($records));

        $this->artisan('adria:import-legacy-bookings', ['path' => $path, '--dry-run' => $dryRun])->assertSuccessful();

        unlink($path);
    }

    public function test_dry_run_writes_nothing(): void
    {
        $this->runImport([$this->record()], dryRun: true);

        $this->assertSame(0, Booking::query()->count());
    }

    public function test_it_imports_a_booking_with_its_tour_date_contact_and_passengers_once(): void
    {
        $this->runImport([$this->record()]);
        $this->runImport([$this->record()]);

        $booking = Booking::query()->sole();
        $this->assertSame('Szl-8830', $booking->offer_code);
        $this->assertSame($this->tour->id, $booking->tour_id);
        $this->assertSame($this->tourDate->id, $booking->tour_date_id);
        $this->assertSame(TourBookingStatus::CONFIRMED, $booking->status);
        $this->assertFalse((bool) $booking->seats_reserved);
        $this->assertSame(2, $booking->passenger_count);
        $this->assertSame(170800.0, (float) $booking->total_amount);
        $this->assertSame('2026-10-06 20:39:29', $booking->created_at->format('Y-m-d H:i:s'));
        $this->assertSame('Fő utca 1.', $booking->payload['formData']['contact_address']);
        $this->assertSame([
            'passenger_name' => 'Teszt Anna',
            'document_number' => 'CD654321',
            'passenger_address' => '3530, Miskolc, Fő utca 1.',
            'passenger_birth_date' => '1982-03-04',
        ], $booking->payload['passengers'][1]);
        $this->assertStringContainsString('Biztosítás: ALFA Compass utasbiztosítás', $booking->admin_note);
        $this->assertSame(40, $this->tourDate->fresh()->price_box_available_seats);
        Mail::assertNothingSent();
    }

    public function test_offer_names_match_tours_regardless_of_subtitle_and_accents(): void
    {
        $this->runImport([$this->record(['offerName' => 'Szlovéniai Pillanatok  ( Bled és Ljubljana )'])]);

        $this->assertSame($this->tour->id, Booking::query()->sole()->tour_id);
    }

    public function test_cancelled_bookings_and_unknown_offers_are_kept_and_flagged(): void
    {
        $this->runImport([$this->record([
            'id' => 2552,
            'position' => '',
            'canceled' => '1',
            'offerName' => 'Karnevál a lagúnák városában',
            'offerDate' => '2026-02-13 — 2026-02-15',
        ])]);

        $booking = Booking::query()->sole();
        $this->assertSame('legacy-2552', $booking->offer_code);
        $this->assertSame(TourBookingStatus::CANCELLED, $booking->status);
        $this->assertNull($booking->tour_id);
        $this->assertSame('Karnevál a lagúnák városában', $booking->offer_name_snapshot);
        $this->assertSame('2026-02-13', $booking->departure_date->toDateString());
        $this->assertStringContainsString('nem található az új rendszerben', $booking->admin_note);
    }

    public function test_the_tour_and_date_are_found_by_their_legacy_ids_whatever_the_names(): void
    {
        $this->tour->forceFill(['legacy_id' => 1000, 'name' => 'Szlovénia, Európa zöld gyöngyszeme'])->save();
        $this->tourDate->forceFill(['legacy_id' => 12089, 'start_date' => '2026-10-31', 'end_date' => '2026-11-01'])->save();

        $this->runImport([$this->record()]);

        $booking = Booking::query()->sole();
        $this->assertSame($this->tour->id, $booking->tour_id);
        $this->assertSame($this->tourDate->id, $booking->tour_date_id);
        $this->assertSame('213', $booking->payload['legacy']['departureId']);
    }

    public function test_a_rerun_refreshes_an_imported_booking_and_keeps_what_the_new_system_added(): void
    {
        $this->runImport([$this->record()]);
        $booking = Booking::query()->sole();
        $booking->update(['status' => TourBookingStatus::CONTACTED, 'admin_note' => 'Az iroda megjegyzése.']);

        $this->runImport([$this->record(['mobile' => '+36309998877', 'price' => '180000'])]);

        $booking->refresh();
        $this->assertSame('+36309998877', $booking->phone);
        $this->assertEquals(180000, $booking->total_amount);
        $this->assertSame(TourBookingStatus::CONTACTED, $booking->status);
        $this->assertSame('Az iroda megjegyzése.', $booking->admin_note);
        $this->assertSame(1, Booking::query()->count());

        $this->runImport([$this->record(['mobile' => '+36309998877', 'price' => '180000', 'canceled' => '1'])]);
        $this->assertSame(TourBookingStatus::CANCELLED, $booking->fresh()->status);
        $this->assertTrue($booking->fresh()->cancelled);
    }

    public function test_a_booking_of_the_new_site_with_the_same_code_is_left_alone(): void
    {
        $own = Booking::factory()->create(['booking_type' => 'tour_booking', 'offer_code' => 'Szl-8830', 'customer_name' => 'Új oldali foglaló', 'payload' => []]);

        $this->runImport([$this->record()]);

        $this->assertSame('Új oldali foglaló', $own->fresh()->customer_name);
        $this->assertSame(1, Booking::query()->count());
    }

    public function test_a_price_no_real_booking_has_is_left_out_and_noted(): void
    {
        $this->runImport([$this->record(['price' => '133931600', 'adults' => '998'])]);

        $booking = Booking::query()->sole();
        $this->assertNull($booking->total_amount);
        $this->assertSame('133931600', $booking->payload['legacy']['price']);
        $this->assertStringContainsString('A régi ár (133931600) nem valós összeg', $booking->admin_note);
    }
}
