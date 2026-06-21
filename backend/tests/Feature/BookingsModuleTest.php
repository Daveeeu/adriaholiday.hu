<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\ContactMessage;
use App\Models\Coupon;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BookingsModuleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    public function test_booking_list_endpoints_use_frontend_envelope(): void
    {
        $this->actingAsAdmin();

        foreach ([
            '/api/admin/bookings',
            '/api/admin/bookings/tour-bookings',
            '/api/admin/bookings/tour-inquiries',
            '/api/admin/bookings/apartment-bookings',
            '/api/admin/bookings/partner-finances',
            '/api/admin/bookings/banners',
            '/api/admin/bookings/messages',
            '/api/admin/bookings/coupons',
        ] as $endpoint) {
            $response = $this->getJson($endpoint.'?page=1&perPage=5');

            $response->assertOk();
            $response->assertJsonStructure([
                'items',
                'totalCount',
                'page',
                'perPage',
            ]);
            $response->assertJsonMissingPath('data');
            $response->assertJsonMissingPath('meta');
        }
    }

    public function test_tour_booking_alias_route_returns_only_tour_bookings(): void
    {
        $this->actingAsAdmin();

        $response = $this->getJson('/api/admin/bookings/tour-bookings?page=1&perPage=100');

        $response->assertOk();
        $response->assertJsonPath('items.0.bookingType', 'tour_booking');
        $this->assertSame(
            30,
            collect($response->json('items'))->where('bookingType', 'tour_booking')->count(),
        );
    }

    public function test_tour_inquiry_alias_route_returns_only_tour_inquiries(): void
    {
        $this->actingAsAdmin();

        $response = $this->getJson('/api/admin/bookings/tour-inquiries?page=1&perPage=100');

        $response->assertOk();
        $response->assertJsonPath('items.0.bookingType', 'tour_inquiry');
        $this->assertSame(
            30,
            collect($response->json('items'))->where('bookingType', 'tour_inquiry')->count(),
        );
    }

    public function test_apartment_booking_alias_route_returns_only_apartment_bookings(): void
    {
        $this->actingAsAdmin();

        $response = $this->getJson('/api/admin/bookings/apartment-bookings?page=1&perPage=100');

        $response->assertOk();
        $response->assertJsonPath('items.0.bookingType', 'apartment_booking');
        $this->assertSame(
            30,
            collect($response->json('items'))->where('bookingType', 'apartment_booking')->count(),
        );
    }

    public function test_coupon_create_and_update_work(): void
    {
        $this->actingAsAdmin();

        $createResponse = $this->postJson('/api/admin/bookings/coupons', [
            'active' => true,
            'name' => 'Teszt kupon',
            'email' => 'test@example.com',
            'code' => 'TEST-2026',
            'value' => 15,
            'expires_at' => '2026-12-31',
            'used' => false,
        ]);

        $createResponse->assertCreated();
        $createResponse->assertJsonFragment(['code' => 'TEST-2026']);

        $couponId = $createResponse->json('data.id') ?? $createResponse->json('id');

        $updateResponse = $this->patchJson("/api/admin/bookings/coupons/{$couponId}", [
            'active' => false,
            'name' => 'Teszt kupon frissítve',
            'email' => 'updated@example.com',
            'code' => 'TEST-2026',
            'value' => 25,
            'expires_at' => '2027-01-31',
            'used' => true,
        ]);

        $updateResponse->assertOk();
        $updateResponse->assertJsonFragment(['name' => 'Teszt kupon frissítve']);
        $updateResponse->assertJsonFragment(['used' => true]);
    }

    public function test_message_status_update_works(): void
    {
        $this->actingAsAdmin();

        /** @var ContactMessage $message */
        $message = ContactMessage::query()->firstOrFail();

        $response = $this->patchJson("/api/admin/bookings/messages/{$message->id}/status", [
            'status' => 'read',
        ]);

        $response->assertOk();
        $response->assertJsonFragment(['status' => 'read']);
        $this->assertDatabaseHas('contact_messages', [
            'id' => $message->id,
            'status' => 'read',
        ]);
    }

    public function test_tour_booking_create_validation_errors_return_422(): void
    {
        $this->actingAsAdmin();

        $response = $this->postJson('/api/admin/bookings/tour-bookings', [
            'email' => 'not-an-email',
            'adults' => -1,
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['email', 'adults']);
    }

    public function test_admin_permission_is_required_for_region_create(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/admin/regions', [
            'name' => 'Forbidden region',
            'slug' => 'forbidden-region',
            'country_code' => 'HR',
            'timezone' => 'Europe/Budapest',
            'currency' => 'EUR',
            'summary' => 'Test',
            'description' => 'Test description',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $response->assertForbidden();
    }

    private function actingAsAdmin(): void
    {
        $user = User::query()->where('email', 'info@jandldavid.hu')->firstOrFail();

        Sanctum::actingAs($user);
    }
}
