<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TourListSortTest extends TestCase
{
    use RefreshDatabase;

    private Tour $alma;

    private Tour $barack;

    private Tour $citrom;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RolePermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole('Super Admin');
        Sanctum::actingAs($user);

        $this->alma = Tour::factory()->create(['name' => 'Alma', 'price' => 300]);
        $this->barack = Tour::factory()->create(['name' => 'Barack', 'price' => 100]);
        $this->citrom = Tour::factory()->create(['name' => 'Citrom', 'price' => null]);
    }

    private function namesSortedBy(string $sortBy, string $direction = 'asc'): array
    {
        return collect($this->getJson("/api/admin/tours?sortBy={$sortBy}&sortDirection={$direction}")->assertOk()->json('items'))
            ->pluck('name')
            ->all();
    }

    public function test_sorts_by_name_in_both_directions(): void
    {
        $this->assertSame(['Alma', 'Barack', 'Citrom'], $this->namesSortedBy('name'));
        $this->assertSame(['Citrom', 'Barack', 'Alma'], $this->namesSortedBy('name', 'desc'));
    }

    public function test_tours_without_a_price_come_last_in_both_directions(): void
    {
        $this->assertSame(['Barack', 'Alma', 'Citrom'], $this->namesSortedBy('price'));
        $this->assertSame(['Alma', 'Barack', 'Citrom'], $this->namesSortedBy('price', 'desc'));
    }

    public function test_sorts_by_creation_date(): void
    {
        $this->alma->forceFill(['created_at' => now()->subDays(3)])->saveQuietly();
        $this->barack->forceFill(['created_at' => now()->subDay()])->saveQuietly();
        $this->citrom->forceFill(['created_at' => now()->subDays(2)])->saveQuietly();

        $this->assertSame(['Barack', 'Citrom', 'Alma'], $this->namesSortedBy('createdAt', 'desc'));
    }

    public function test_sorts_by_latest_booking_and_reports_it(): void
    {
        $older = $this->booking($this->barack);
        $older->forceFill(['created_at' => now()->subWeek()])->saveQuietly();
        $newer = $this->booking($this->citrom);
        $newer->forceFill(['created_at' => now()->subDay()])->saveQuietly();

        $this->assertSame(['Citrom', 'Barack', 'Alma'], $this->namesSortedBy('lastBookingAt', 'desc'));

        $first = $this->getJson('/api/admin/tours?sortBy=lastBookingAt&sortDirection=desc')->json('items.0');
        $this->assertSame($newer->created_at->toDateString(), substr($first['lastBookingAt'], 0, 10));
    }

    public function test_most_booked_ignores_cancelled_and_other_booking_types(): void
    {
        $this->booking($this->alma);
        $this->booking($this->barack);
        $this->booking($this->barack);
        $this->booking($this->citrom, ['cancelled' => true]);
        $this->booking($this->citrom, ['booking_type' => 'tour_inquiry']);

        $this->assertSame(['Barack', 'Alma', 'Citrom'], $this->namesSortedBy('bookingsCount', 'desc'));
        $this->assertSame(2, $this->getJson('/api/admin/tours?sortBy=bookingsCount&sortDirection=desc')->json('items.0.bookingsCount'));
    }

    public function test_next_departure_ignores_past_dates_and_tours_without_one_come_last(): void
    {
        TourDate::factory()->create(['tour_id' => $this->alma->id, 'start_date' => now()->subMonth()]);
        TourDate::factory()->create(['tour_id' => $this->barack->id, 'start_date' => now()->addMonth()]);
        TourDate::factory()->create(['tour_id' => $this->citrom->id, 'start_date' => now()->addWeek()]);

        $this->assertSame(['Citrom', 'Barack', 'Alma'], $this->namesSortedBy('nextDepartureDate'));
    }

    public function test_unknown_sort_falls_back_to_the_default_order(): void
    {
        $this->getJson('/api/admin/tours?sortBy=password')->assertOk();
    }

    private function booking(Tour $tour, array $attributes = []): Booking
    {
        return Booking::factory()->create([
            'tour_id' => $tour->id,
            'booking_type' => 'tour_booking',
            'cancelled' => false,
            ...$attributes,
        ]);
    }
}
