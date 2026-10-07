<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\User;
use App\Support\Booking\TourBookingStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminBookingPdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_downloads_a_tour_booking_as_pdf(): void
    {
        $tour = Tour::factory()->create(['name' => 'Szlovéniai pillanatok']);
        $booking = $this->booking(['tour_id' => $tour->id, 'offer_code' => 'Szl-8830']);
        $this->actingAsAdminWith(['bookings.view']);

        $response = $this->get("/api/admin/bookings/tour-bookings/{$booking->id}/pdf");

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
        $this->assertStringContainsString('foglalas-szl-8830.pdf', (string) $response->headers->get('content-disposition'));
        $this->assertStringStartsWith('%PDF-', $response->getContent());
    }

    public function test_an_imported_booking_without_a_tour_still_renders(): void
    {
        $booking = $this->booking(['tour_id' => null, 'offer_name_snapshot' => 'Karnevál Velencében', 'offer_code' => 'legacy-2552']);
        $this->actingAsAdminWith(['bookings.view']);

        $this->get("/api/admin/bookings/tour-bookings/{$booking->id}/pdf")->assertOk();
    }

    public function test_the_pdf_needs_the_booking_view_permission(): void
    {
        $booking = $this->booking();
        $this->actingAsAdminWith(['bookings.viewAny']);

        $this->getJson("/api/admin/bookings/tour-bookings/{$booking->id}/pdf")->assertForbidden();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function booking(array $attributes = []): Booking
    {
        return Booking::query()->create([
            'booking_type' => 'tour_booking',
            'status' => TourBookingStatus::CONFIRMED,
            'customer_name' => 'Teszt Elek',
            'email' => 'teszt@example.com',
            'passenger_count' => 1,
            'total_amount' => 85400,
            'currency' => 'HUF',
            'admin_note' => 'Ablak melletti hely.',
            'payload' => [
                'formData' => ['contact_name' => 'Teszt Elek', 'contact_email' => 'teszt@example.com'],
                'passengers' => [['passenger_name' => 'Teszt Elek', 'passenger_birth_date' => '1980-01-02']],
            ],
            ...$attributes,
        ]);
    }

    /**
     * @param  array<int, string>  $permissions
     */
    private function actingAsAdminWith(array $permissions): void
    {
        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Booking PDF Test', 'web');
        $role->syncPermissions($permissions);
        $user = User::factory()->create();
        $user->assignRole($role);

        Sanctum::actingAs($user);
    }
}
