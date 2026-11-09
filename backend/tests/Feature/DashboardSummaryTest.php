<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Coupon;
use App\Models\Tour;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

class DashboardSummaryTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_summary_returns_counts_and_series(): void
    {
        $this->actingAsAdmin();

        $this->getJson('/api/admin/dashboard/summary')
            ->assertOk()
            ->assertJsonStructure([
                'counts' => [
                    'apartments',
                    'tours',
                    'bookings',
                    'messages',
                    'coupons',
                    'homepageOffers',
                    'blogArticles',
                    'buses',
                    'newBookings',
                    'upcomingBookings',
                    'newInquiries',
                    'monthlyRevenue',
                ],
                'monthlyRevenue' => [
                    '*' => [
                        'month',
                        'revenue',
                    ],
                ],
                'recentActivity' => [
                    '*' => [
                        'id',
                        'title',
                        'description',
                        'timestamp',
                        'targetUrl',
                        'kind',
                    ],
                ],
            ]);
    }

    public function test_counts_only_what_needs_attention(): void
    {
        $this->actingAsAdmin();

        $tourBooking = fn (array $attributes) => Booking::factory()->create([
            'booking_type' => 'tour_booking',
            'cancelled' => false,
            ...$attributes,
        ]);

        $tourBooking(['status' => 'new', 'departure_date' => now()->addMonth()]);
        $tourBooking(['status' => 'confirmed', 'departure_date' => now()->addWeek()]);
        $tourBooking(['status' => 'confirmed', 'departure_date' => now()->subYear()]);
        $tourBooking(['status' => 'new', 'cancelled' => true, 'departure_date' => now()->addWeek()]);

        Tour::factory()->create(['active' => true]);
        Tour::factory()->create(['active' => false]);

        Coupon::factory()->create(['active' => true, 'used' => false, 'expires_at' => null]);
        Coupon::factory()->create(['active' => true, 'used' => true, 'expires_at' => null]);
        Coupon::factory()->create(['active' => true, 'used' => false, 'expires_at' => now()->subDay()]);

        $this->getJson('/api/admin/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('counts.newBookings', 1)
            ->assertJsonPath('counts.upcomingBookings', 2)
            ->assertJsonPath('counts.tours', 1)
            ->assertJsonPath('counts.coupons', 1);
    }

    public function test_revenue_series_covers_only_the_last_twelve_months(): void
    {
        $this->actingAsAdmin();

        $old = Booking::factory()->create([
            'booking_type' => 'tour_booking',
            'cancelled' => false,
            'total_amount' => 1000,
        ]);
        $old->forceFill(['created_at' => now()->subYears(5)])->saveQuietly();

        Booking::factory()->create([
            'booking_type' => 'tour_booking',
            'cancelled' => false,
            'total_amount' => 2000,
        ]);

        $series = $this->getJson('/api/admin/dashboard/summary')->assertOk()->json('monthlyRevenue');

        $this->assertCount(12, $series);
        $this->assertSame(now()->subMonths(11)->format('Y-m'), $series[0]['month']);
        $this->assertSame(now()->format('Y-m'), $series[11]['month']);
        $this->assertEquals(2000, $series[11]['revenue']);
    }

    public function test_repeated_saves_of_one_thing_show_as_one_activity(): void
    {
        $admin = $this->actingAsAdmin();
        $tour = Tour::factory()->create(['name' => 'Toszkán körút']);
        Activity::query()->delete();

        foreach (range(1, 3) as $ignored) {
            activity()->performedOn($tour)->causedBy($admin)->event('updated')->log('updated');
        }

        $activity = $this->getJson('/api/admin/dashboard/summary')->assertOk()->json('recentActivity');

        $this->assertCount(1, $activity);
        $this->assertSame('Körutazás módosítva (3×)', $activity[0]['title']);
        $this->assertSame('Toszkán körút • '.$admin->name, $activity[0]['description']);
        $this->assertSame('/tours', $activity[0]['targetUrl']);
    }

    private function actingAsAdmin(): User
    {
        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('Super Admin');

        Sanctum::actingAs($user);

        return $user;
    }
}
