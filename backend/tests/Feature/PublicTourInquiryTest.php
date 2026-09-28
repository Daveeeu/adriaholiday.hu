<?php

namespace Tests\Feature;

use App\Mail\NewTourInquiryOfficeNotification;
use App\Models\Booking;
use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicTourInquiryTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(Tour $tour, array $overrides = []): array
    {
        return array_merge([
            'tourId' => $tour->id,
            'name' => 'Kovács Anna',
            'email' => 'anna@example.com',
            'phone' => '+36301234567',
            'postalCode' => '1051',
            'city' => 'Budapest',
            'street' => 'Példa utca 12.',
            'dateFrom' => today()->addMonths(3)->toDateString(),
            'dateTo' => today()->addMonths(3)->addDays(4)->toDateString(),
            'passengerCount' => 25,
            'message' => 'Céges kirándulás.',
            'privacyAccepted' => true,
        ], $overrides);
    }

    public function test_group_quote_request_is_stored_as_a_tour_inquiry(): void
    {
        $tour = Tour::factory()->create(['active' => true]);

        $response = $this->postJson('/api/tour-inquiries', $this->payload($tour));

        $response->assertCreated();

        $inquiry = Booking::query()->findOrFail($response->json('id'));
        $this->assertSame('tour_inquiry', $inquiry->booking_type);
        $this->assertSame($tour->id, $inquiry->tour_id);
        $this->assertSame($tour->name, $inquiry->offer_name_snapshot);
        $this->assertSame(25, $inquiry->passenger_count);
        $this->assertSame(today()->addMonths(3)->toDateString(), $inquiry->arrival->toDateString());
        $this->assertSame('1051', $inquiry->payload['postalCode']);
        $this->assertNull($inquiry->total_amount);

        $html = (new NewTourInquiryOfficeNotification($inquiry, $tour))->render();
        $this->assertStringContainsString('Utasok száma: 25 fő', $html);
        $this->assertStringContainsString('1051, Budapest, Példa utca 12.', $html);
    }

    public function test_group_quote_requires_at_least_twenty_passengers_valid_dates_and_consent(): void
    {
        $tour = Tour::factory()->create(['active' => true]);

        $response = $this->postJson('/api/tour-inquiries', $this->payload($tour, [
            'passengerCount' => 12,
            'dateFrom' => today()->subDay()->toDateString(),
            'dateTo' => today()->subDays(3)->toDateString(),
            'privacyAccepted' => false,
            'email' => 'nem-email',
        ]));

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['passenger_count', 'date_from', 'date_to', 'privacy_accepted', 'email']);
        $this->assertSame(0, Booking::query()->count());
    }

    public function test_group_quote_is_rejected_for_inactive_tours(): void
    {
        $tour = Tour::factory()->create(['active' => false]);

        $this->postJson('/api/tour-inquiries', $this->payload($tour))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['tour_id']);
    }
}
