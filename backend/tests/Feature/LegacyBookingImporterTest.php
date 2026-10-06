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
}
