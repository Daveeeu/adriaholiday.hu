<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDeparturePlace;
use App\Models\User;
use App\Services\Tour\DeparturePlaceConsolidator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class TourDeparturePlacesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_consolidation_gives_each_tour_its_destination_route_with_one_place_per_town(): void
    {
        $bok = $this->place('Budapest BOK Csarnok');
        $miskolcParking = $this->place('Miskolc, Centrum Áruház mögötti parkoló');
        $west = $this->place('tatabányai, győri, mosonmagyaróvári indulással');
        $north = $this->place('mezőkövesdi, gyöngyösi, hatvani indulással', city: 'Mezökövesd, Gyöngyös, Hatvan');
        $route = $this->place('Miskolc-Mezőkövesd-Gyöngyös-Hatvan-Budapest');
        $budapesti = $this->place('budapesti indulással', city: 'Bp');
        $seededSiofok = $this->place('Siófok', 18);
        $unused = $this->place('Zalaegerszeg');

        $austria = $this->tour('Hallstatt', ['at'], 'bus', [$bok->id => 4700, $west->id => null, $north->id => null]);
        $italy = $this->tour('Toszkána', ['it'], 'bus', [$route->id => null]);
        $wroclaw = $this->tour('Wroclaw törpéitől', ['cz', 'pl'], 'bus', [$bok->id => null, $north->id => null, $miskolcParking->id => null]);
        $zakopane = $this->tour('Advent Zakopaneban 1 nap', ['pl'], 'bus', [$miskolcParking->id => null]);
        $london = $this->tour('London (repülő)', ['gb'], 'plane', [$budapesti->id => null]);
        $istanbul = $this->tour('Isztambul', ['tr'], 'bus', [$bok->id => null, $north->id => null]);
        $domestic = $this->tour('Tállya', ['hu'], null, []);

        $date = TourDate::factory()->for($austria)->create(['departure_place_ids' => [$bok->id, $north->id]]);

        $this->artisan('adria:departure-places:consolidate', ['--force' => true])->assertSuccessful();

        $this->assertTowns(DeparturePlaceConsolidator::ROUTES['west'], $austria);
        $this->assertTowns(DeparturePlaceConsolidator::ROUTES['south'], $italy);
        $this->assertTowns(DeparturePlaceConsolidator::ROUTES['north'], $wroclaw);
        $this->assertTowns(['Miskolc'], $zakopane);
        $this->assertTowns(['Budapest'], $london);
        $this->assertTowns(['Budapest', 'Mezőkövesd', 'Gyöngyös', 'Hatvan'], $istanbul);
        $this->assertTowns([], $domestic);

        $this->assertSame(4700.0, (float) $austria->departurePlaces()->where('name', 'Budapest')->first()->pivot->fee);
        $this->assertNull($austria->departurePlaces()->where('name', 'Győr')->first()->pivot->fee);

        $siofok = $seededSiofok->fresh();
        $this->assertSame('Siófok', $siofok->city);
        $this->assertNull($siofok->fee);
        $this->assertTrue($italy->departurePlaces()->whereKey($siofok->id)->exists());

        $offered = TourDeparturePlace::query()->whereKey($date->fresh()->departure_place_ids)->pluck('name')->sort()->values()->all();
        $this->assertSame(['Budapest', 'Gyöngyös', 'Hatvan', 'Mezőkövesd'], $offered);

        foreach ([$bok, $miskolcParking, $west, $north, $route, $budapesti, $unused] as $place) {
            $this->assertSoftDeleted($place);
        }

        $this->assertSame(1, TourDeparturePlace::query()->where('name', 'Budapest')->count());
        $this->assertFalse(TourDeparturePlace::query()->whereIn('name', ['Bp', 'Mezökövesd'])->exists());
    }

    public function test_dry_run_changes_nothing(): void
    {
        $route = $this->place('Miskolc-Mezőkövesd-Gyöngyös-Hatvan-Budapest');
        $tour = $this->tour('Toszkána', ['it'], 'bus', [$route->id => null]);

        $this->artisan('adria:departure-places:consolidate', ['--dry-run' => true])->assertSuccessful();

        $this->assertSame([$route->id], $tour->departurePlaces()->pluck('tour_departure_places.id')->all());
        $this->assertSame(1, TourDeparturePlace::query()->count());
    }

    public function test_a_place_name_must_be_a_single_town_and_unique(): void
    {
        $this->actingAsPlaceAdmin();
        $miskolc = $this->place('Miskolc');

        foreach (['Miskolc-Mezőkövesd-Budapest', 'mezőkövesdi, gyöngyösi indulással', 'Budapest / Győr', 'Miskolc'] as $name) {
            $this->postJson('/api/admin/tour-departure-places', ['name' => $name])->assertJsonValidationErrors('name');
        }

        $this->postJson('/api/admin/tour-departure-places', ['name' => 'Budapest BOK csarnok'])->assertCreated();
        $this->putJson("/api/admin/tour-departure-places/{$miskolc->id}", ['name' => 'Miskolc'])->assertOk();
    }

    private function place(string $name, ?float $fee = null, ?string $city = null): TourDeparturePlace
    {
        return TourDeparturePlace::query()->create(['active' => true, 'name' => $name, 'city' => $city, 'fee' => $fee]);
    }

    /**
     * @param  array<int, float|null>  $places  fee by place id
     */
    private function tour(string $name, array $countries, ?string $travelMode, array $places): Tour
    {
        $tour = Tour::factory()->create(['name' => $name, 'country_ids' => $countries, 'travel_mode_id' => $travelMode]);
        $tour->departurePlaces()->sync(collect($places)->map(fn (?float $fee): array => ['fee' => $fee])->all());

        return $tour;
    }

    /**
     * @param  array<int, string>  $towns
     */
    private function assertTowns(array $towns, Tour $tour): void
    {
        $this->assertEqualsCanonicalizing($towns, $tour->departurePlaces()->pluck('name')->all(), $tour->name);
    }

    private function actingAsPlaceAdmin(): void
    {
        $permissions = ['tour-departure-places.create', 'tour-departure-places.update'];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Departure Place Test Admin', 'web');
        $role->syncPermissions($permissions);

        $user = User::query()->create([
            'name' => 'Departure Place Test Admin',
            'email' => 'departure-place-admin@example.com',
            'password' => 'password',
        ]);
        $user->assignRole($role);

        Sanctum::actingAs($user);
    }
}
