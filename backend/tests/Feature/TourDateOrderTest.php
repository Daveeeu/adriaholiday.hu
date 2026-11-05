<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\TourDate;
use App\Models\User;
use App\Services\Tour\TourContentSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class TourDateOrderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->travelTo('2026-11-05');
    }

    public function test_dates_keep_the_order_the_admin_sends_on_the_admin_and_the_public_page(): void
    {
        $this->actingAsTourEditor();
        $tour = Tour::factory()->create(['active' => true, 'seo_name' => 'rendezett-idopontok']);
        $july = $this->date($tour, '2027-07-01', 1);
        $may = $this->date($tour, '2027-05-01', 2);

        $this->getJson('/api/portfolio/offers/rendezett-idopontok')
            ->assertOk()
            ->assertJsonPath('dates.0.id', $july->id);

        // May moved first and a new date added last.
        $this->patchJson("/api/admin/tours/{$tour->id}", $this->payload($tour, [
            ['id' => (string) $may->id, 'startDate' => '2027-05-01', 'endDate' => '2027-05-05'],
            ['id' => (string) $july->id, 'startDate' => '2027-07-01', 'endDate' => '2027-07-05'],
            ['id' => 'new-date', 'startDate' => '2027-03-01', 'endDate' => '2027-03-05'],
        ]))
            ->assertOk()
            ->assertJsonPath('data.dates.0.id', $may->id)
            ->assertJsonPath('data.dates.1.id', $july->id)
            ->assertJsonPath('data.dates.2.startDate', '2027-03-01')
            ->assertJsonPath('data.dates.2.sortOrder', 3);

        // The save bumps the public cache; the page follows the set order, not the calendar.
        $this->getJson('/api/portfolio/offers/rendezett-idopontok')
            ->assertOk()
            ->assertJsonPath('dates.0.id', $may->id)
            ->assertJsonPath('dates.1.id', $july->id)
            ->assertJsonPath('dates.2.startDate', '2027-03-01');
    }

    public function test_a_date_added_without_an_order_goes_after_the_stored_ones(): void
    {
        $tour = Tour::factory()->create();
        $stored = $this->date($tour, '2027-07-01', 4);

        app(TourContentSyncService::class)->syncDates($tour, [
            ['legacy_id' => 1, 'start_date' => '2027-01-10', 'end_date' => '2027-01-14'],
            ['id' => $stored->id, 'start_date' => '2027-07-01', 'end_date' => '2027-07-05'],
        ]);

        $this->assertSame(
            [[$stored->id, 4], ['2027-01-10', 5]],
            $tour->dates()->get()->map(fn (TourDate $date): array => [
                $date->is($stored) ? $date->id : $date->start_date->toDateString(),
                $date->sort_order,
            ])->all(),
        );
    }

    private function date(Tour $tour, string $startDate, int $sortOrder): TourDate
    {
        return $tour->dates()->create([
            'sort_order' => $sortOrder,
            'start_date' => $startDate,
            'end_date' => date('Y-m-d', strtotime($startDate.' +4 days')),
            'status' => 'available',
        ]);
    }

    /**
     * @param  list<array<string, mixed>>  $dates
     * @return array<string, mixed>
     */
    private function payload(Tour $tour, array $dates): array
    {
        return [
            'active' => true,
            'name' => $tour->name,
            'seo_name' => $tour->seo_name,
            'seo_auto_generate' => false,
            'dates' => array_map(fn (array $date): array => [...$date, 'status' => 'available'], $dates),
        ];
    }

    private function actingAsTourEditor(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate('tours.update', 'web'));

        Sanctum::actingAs($user);
    }
}
