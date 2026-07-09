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
