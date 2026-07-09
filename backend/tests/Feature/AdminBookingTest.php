<?php

namespace Tests\Feature;

use App\Mail\NewTourBookingOfficeNotification;
use App\Mail\TourBookingCustomerConfirmation;
use App\Models\Booking;
use App\Models\Tour;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AdminBookingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_public_booking_rejected_when_not_enough_seats(): void
    {
        $tour = Tour::factory()->create(['active' => true]);
        $date = $tour->dates()->create([
            'start_date' => now()->addMonth(),
            'end_date' => now()->addMonth()->addDays(7),
            'status' => 'available',
            'price_box_available_seats' => 1,
        ]);

        $response = $this->postJson('/api/bookings', [
            'tourId' => $tour->id,
            'tourDateId' => $date->id,
            'formData' => [
                'contact_name' => 'Kovács Anna',
                'contact_email' => 'anna@example.com',
                'contact_phone' => '+36301234567',
            ],
            'passengers' => [
                ['passenger_name' => 'Kovács Anna', 'passenger_birth_date' => '1990-01-01'],
                ['passenger_name' => 'Kovács Béla', 'passenger_birth_date' => '1988-01-01'],
            ],
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['tour_date_id']);
    }

    public function test_new_tour_booking_sends_office_and_customer_emails(): void
    {
        Mail::fake();

        config(['mail.office_notifications_address' => 'office@adriaholiday.hu']);

        $tour = Tour::factory()->create(['active' => true]);

        $response = $this->postJson('/api/bookings', [
            'tourId' => $tour->id,
            'formData' => [
                'contact_name' => 'Kovács Anna',
                'contact_email' => 'anna@example.com',
                'contact_phone' => '+36301234567',
            ],
            'passengers' => [
                ['passenger_name' => 'Kovács Anna', 'passenger_birth_date' => '1990-01-01'],
            ],
        ]);

        $response->assertCreated();

        Mail::assertSent(NewTourBookingOfficeNotification::class, fn ($mail) => $mail->hasTo('office@adriaholiday.hu'));
        Mail::assertSent(TourBookingCustomerConfirmation::class, fn ($mail) => $mail->hasTo('anna@example.com'));
    }

    public function test_confirming_booking_reserves_seats_and_cancelling_releases_them(): void
    {
        $tour = Tour::factory()->create(['active' => true]);
        $date = $tour->dates()->create([
            'start_date' => now()->addMonth(),
            'end_date' => now()->addMonth()->addDays(7),
            'status' => 'available',
            'price_box_available_seats' => 5,
        ]);

        $booking = Booking::factory()->create([
            'booking_type' => 'tour_booking',
            'status' => 'new',
            'tour_id' => $tour->id,
            'tour_date_id' => $date->id,
            'passenger_count' => 2,
        ]);

        $this->actingAsBookingAdmin(['bookings.viewAny', 'bookings.view', 'bookings.status']);

        $confirmResponse = $this->patchJson("/api/admin/bookings/tour-bookings/{$booking->id}/status", [
            'status' => 'confirmed',
        ]);

        $confirmResponse->assertOk();
        $confirmResponse->assertJsonPath('data.status', 'confirmed');
        $this->assertSame(3, $date->fresh()->price_box_available_seats);
        $this->assertTrue($booking->fresh()->seats_reserved);

        $cancelResponse = $this->patchJson("/api/admin/bookings/tour-bookings/{$booking->id}/status", [
            'status' => 'cancelled',
        ]);

        $cancelResponse->assertOk();
        $this->assertSame(5, $date->fresh()->price_box_available_seats);
        $this->assertFalse($booking->fresh()->seats_reserved);
    }

    public function test_invalid_status_transition_is_rejected(): void
    {
        $booking = Booking::factory()->create([
            'booking_type' => 'tour_booking',
            'status' => 'cancelled',
        ]);

        $this->actingAsBookingAdmin(['bookings.viewAny', 'bookings.view', 'bookings.status']);

        $response = $this->patchJson("/api/admin/bookings/tour-bookings/{$booking->id}/status", [
            'status' => 'confirmed',
        ]);

        $response->assertStatus(422);
        $this->assertSame('cancelled', $booking->fresh()->status);
    }

    public function test_admin_can_view_booking_activity_timeline(): void
    {
        $this->actingAsBookingAdmin(['bookings.viewAny', 'bookings.view', 'bookings.status']);

        $booking = Booking::factory()->create([
            'booking_type' => 'tour_booking',
            'status' => 'new',
        ]);

        $this->patchJson("/api/admin/bookings/tour-bookings/{$booking->id}/status", [
            'status' => 'contacted',
        ])->assertOk();

        $response = $this->getJson("/api/admin/bookings/tour-bookings/{$booking->id}/activities");

        $response->assertOk();
        $this->assertNotEmpty($response->json('data'));
    }

    public function test_bookings_export_requires_permission(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/admin/bookings/tour-bookings/export')->assertForbidden();

        $this->actingAsBookingAdmin(['bookings.export']);

        $this->getJson('/api/admin/bookings/tour-bookings/export')
            ->assertOk()
            ->assertHeader('content-type', 'text/csv; charset=UTF-8');
    }

    public function test_bookings_index_filters_by_status_and_tour(): void
    {
        $this->actingAsBookingAdmin(['bookings.viewAny']);

        $tourA = Tour::factory()->create();
        $tourB = Tour::factory()->create();

        Booking::factory()->create(['booking_type' => 'tour_booking', 'status' => 'new', 'tour_id' => $tourA->id]);
        Booking::factory()->create(['booking_type' => 'tour_booking', 'status' => 'confirmed', 'tour_id' => $tourA->id]);
        Booking::factory()->create(['booking_type' => 'tour_booking', 'status' => 'new', 'tour_id' => $tourB->id]);

        $response = $this->getJson("/api/admin/bookings/tour-bookings?status=new&tourId={$tourA->id}");

        $response->assertOk();
        $this->assertSame(1, $response->json('totalCount'));
    }

    public function test_booking_detail_handles_missing_tour_date_analytics_email_and_payload(): void
    {
        $this->actingAsBookingAdmin(['bookings.viewAny', 'bookings.view']);

        $booking = Booking::factory()->create([
            'booking_type' => 'tour_booking',
            'status' => 'new',
            'tour_id' => null,
            'tour_date_id' => null,
            'payload' => null,
        ]);

        $showResponse = $this->getJson("/api/admin/bookings/tour-bookings/{$booking->id}");
        $showResponse->assertOk();
        $showResponse->assertJsonPath('data.tour', null);
        $showResponse->assertJsonPath('data.tourDate', null);
        $showResponse->assertJsonPath('data.formDataFields', []);
        $showResponse->assertJsonPath('data.passengerFields', []);

        $analyticsResponse = $this->getJson("/api/admin/bookings/tour-bookings/{$booking->id}/analytics");
        $analyticsResponse->assertOk();
        $this->assertSame([], $analyticsResponse->json('data'));

        $emailsResponse = $this->getJson("/api/admin/bookings/tour-bookings/{$booking->id}/emails");
        $emailsResponse->assertOk();
        $this->assertSame([], $emailsResponse->json('data'));
    }

    public function test_booking_detail_handles_no_passengers_in_payload(): void
    {
        $this->actingAsBookingAdmin(['bookings.viewAny', 'bookings.view']);

        $booking = Booking::factory()->create([
            'booking_type' => 'tour_booking',
            'status' => 'new',
            'payload' => ['formData' => ['contact_name' => 'Kovács Anna'], 'passengers' => []],
        ]);

        $response = $this->getJson("/api/admin/bookings/tour-bookings/{$booking->id}");

        $response->assertOk();
        $response->assertJsonPath('data.passengerFields', []);
        $response->assertJsonCount(1, 'data.formDataFields');
    }

    public function test_booking_detail_shows_multiple_passengers(): void
    {
        $this->actingAsBookingAdmin(['bookings.viewAny', 'bookings.view']);

        $booking = Booking::factory()->create([
            'booking_type' => 'tour_booking',
            'status' => 'new',
            'payload' => [
                'formData' => [],
                'passengers' => [
                    ['passenger_name' => 'Utas Egy'],
                    ['passenger_name' => 'Utas Kettő'],
                    ['passenger_name' => 'Utas Három'],
                ],
            ],
        ]);

        $response = $this->getJson("/api/admin/bookings/tour-bookings/{$booking->id}");

        $response->assertOk();
        $response->assertJsonCount(3, 'data.passengerFields');
    }

    public function test_activity_timeline_reflects_multiple_status_changes_with_hungarian_titles(): void
    {
        $this->actingAsBookingAdmin(['bookings.viewAny', 'bookings.view', 'bookings.status']);

        $booking = Booking::factory()->create(['booking_type' => 'tour_booking', 'status' => 'new']);

        $this->patchJson("/api/admin/bookings/tour-bookings/{$booking->id}/status", ['status' => 'contacted'])->assertOk();
        $this->patchJson("/api/admin/bookings/tour-bookings/{$booking->id}/status", ['status' => 'confirmed'])->assertOk();

        $response = $this->getJson("/api/admin/bookings/tour-bookings/{$booking->id}/activities");

        $response->assertOk();
        $descriptions = collect($response->json('data'))->pluck('description')->all();

        $this->assertContains('Foglalás létrejött', $descriptions);
        $this->assertContains('Kapcsolatfelvétel', $descriptions);
        $this->assertTrue(collect($descriptions)->contains(fn (string $description) => str_starts_with($description, 'Visszaigazolva')));
    }

    public function test_new_booking_email_notifications_are_logged(): void
    {
        config(['mail.office_notifications_address' => 'office@adriaholiday.hu']);

        $tour = Tour::factory()->create(['active' => true]);

        $response = $this->postJson('/api/bookings', [
            'tourId' => $tour->id,
            'formData' => [
                'contact_name' => 'Kovács Anna',
                'contact_email' => 'anna@example.com',
                'contact_phone' => '+36301234567',
            ],
            'passengers' => [
                ['passenger_name' => 'Kovács Anna', 'passenger_birth_date' => '1990-01-01'],
            ],
        ]);

        $response->assertCreated();
        $bookingId = $response->json('id');

        $this->assertDatabaseHas('email_logs', [
            'booking_id' => $bookingId,
            'to' => 'office@adriaholiday.hu',
            'status' => 'sent',
        ]);
        $this->assertDatabaseHas('email_logs', [
            'booking_id' => $bookingId,
            'to' => 'anna@example.com',
            'status' => 'sent',
        ]);

        $this->actingAsBookingAdmin(['bookings.viewAny', 'bookings.view']);

        $emailsResponse = $this->getJson("/api/admin/bookings/tour-bookings/{$bookingId}/emails");
        $emailsResponse->assertOk();
        $this->assertCount(2, $emailsResponse->json('data'));
    }

    public function test_booking_analytics_endpoint_returns_linked_events(): void
    {
        $this->actingAsBookingAdmin(['bookings.viewAny', 'bookings.view']);

        $booking = Booking::factory()->create(['booking_type' => 'tour_booking', 'status' => 'new']);

        \App\Models\AnalyticsEvent::query()->create([
            'event_id' => (string) \Illuminate\Support\Str::uuid(),
            'session_id' => 'sess-1',
            'visitor_id' => 'visitor-1',
            'event_name' => 'booking_success',
            'entity_type' => 'tour',
            'entity_slug' => 'valami-tour',
            'page_url' => '/ajanlat/valami-tour',
            'page_path' => '/ajanlat/valami-tour',
            'utm_source' => 'google',
            'utm_medium' => 'cpc',
            'metadata' => ['booking_id' => $booking->id],
            'consent_analytics' => true,
            'consent_marketing' => false,
        ]);

        $response = $this->getJson("/api/admin/bookings/tour-bookings/{$booking->id}/analytics");

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.utmSource', 'google');
    }

    /**
     * @param  array<int, string>  $permissions
     */
    private function actingAsBookingAdmin(array $permissions): void
    {
        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Booking Test Admin', 'web');
        $role->syncPermissions($permissions);

        $user = User::factory()->create();
        $user->assignRole($role);

        Sanctum::actingAs($user);
    }
}
