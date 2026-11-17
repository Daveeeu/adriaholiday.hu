<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\User;
use App\Services\Booking\BookingTravelBook;
use App\Services\Tour\RouteMap\CountryShapes;
use App\Services\Tour\RouteMap\RouteMapRenderer;
use App\Services\Tour\RouteMap\TourRouteMapService;
use App\Services\Tour\TourPdfService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class TourRouteMapTest extends TestCase
{
    use RefreshDatabase;

    private const STOPS = [
        ['name' => 'Belgrád', 'latitude' => 44.8125, 'longitude' => 20.4612, 'accommodation' => false],
        ['name' => 'Shkoder', 'latitude' => 42.0683, 'longitude' => 19.5126, 'accommodation' => true],
        ['name' => 'Durres', 'latitude' => 41.3231, 'longitude' => 19.4414, 'accommodation' => false],
        ['name' => 'Ohrid', 'latitude' => 41.1231, 'longitude' => 20.8016, 'accommodation' => false],
    ];

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        Storage::fake('public');
    }

    public function test_the_stops_lie_in_their_countries_coastal_towns_included(): void
    {
        $shapes = app(CountryShapes::class);

        $this->assertSame('SRB', $shapes->at(20.4612, 44.8125)['code']);
        $this->assertSame('ALB', $shapes->at(19.4414, 41.3231)['code']);
        $this->assertSame('ENG', $shapes->at(-0.1276, 51.5072)['code']);
        $this->assertNull($shapes->at(-30.0, 40.0));
    }

    public function test_the_map_is_a_png_of_the_route(): void
    {
        $image = imagecreatefromstring(app(RouteMapRenderer::class)->render(self::STOPS));

        $this->assertSame(960, imagesx($image));
        $this->assertSame(640, imagesy($image));
    }

    public function test_crowded_stops_are_zoomed_in_on_until_their_names_fit(): void
    {
        $stop = fn (string $name, float $latitude, float $longitude): array => ['name' => $name, 'latitude' => $latitude, 'longitude' => $longitude, 'accommodation' => false];
        $area = app(RouteMapRenderer::class)->area([
            $stop('Zell am See', 47.325, 12.796), $stop('Kitzsteinhorn', 47.188, 12.687), $stop('Dornbirn', 47.413, 9.744),
            $stop('Sankt Gallen', 47.424, 9.377), $stop('Schaffhausen', 47.696, 8.635), $stop('Mainau', 47.705, 9.195),
            $stop('Luzern', 47.050, 8.309), $stop('Brienz (BE)', 46.754, 8.038), $stop('Rothorn', 46.787, 8.047),
            $stop('St. Bartholomä', 47.548, 12.969),
        ]);

        // Not the whole of Germany, which reaches the Baltic at 55°.
        $this->assertLessThan(51.0, $area[3]);
        $this->assertLessThanOrEqual(8.038, $area[0]);
        $this->assertGreaterThanOrEqual(12.969, $area[2]);
    }

    public function test_a_route_whose_names_fit_shows_its_countries_whole(): void
    {
        $area = app(RouteMapRenderer::class)->area(self::STOPS);
        $split = app(RouteMapRenderer::class)->area([['name' => 'Split', 'latitude' => 43.508, 'longitude' => 16.44, 'accommodation' => true]]);

        // Serbia reaches north to 46.2°, Albania south to 39.6°.
        $this->assertGreaterThan(46.0, $area[3]);
        $this->assertLessThan(40.0, $area[1]);
        // All of Croatia, from Istria to Dubrovnik.
        $this->assertLessThan(13.7, $split[0]);
        $this->assertGreaterThan(19.0, $split[2]);
    }

    public function test_the_trip_page_shows_the_map_drawn_once_for_the_stops(): void
    {
        $tour = Tour::factory()->create(['active' => true, 'seo_name' => 'albania', 'route_stops' => self::STOPS]);

        $routeMap = $this->getJson('/api/portfolio/offers/albania')->assertOk()->json('routeMap');

        $this->assertSame('Az utazás útvonala: Belgrád – Shkoder – Durres – Ohrid', $routeMap['alt']);
        $this->assertStringContainsString('/storage/route-maps/', $routeMap['url']);
        $files = Storage::disk('public')->files('route-maps');
        $this->assertCount(1, $files);

        // A tour with the same stops shares the image.
        Tour::factory()->create(['active' => true, 'seo_name' => 'albania-2', 'route_stops' => self::STOPS]);
        $this->getJson('/api/portfolio/offers/albania-2')->assertOk()->assertJsonPath('routeMap.url', $routeMap['url']);
        $this->assertCount(1, Storage::disk('public')->files('route-maps'));

        $tour->update(['route_stops' => null]);
        $this->assertNull(app(TourRouteMapService::class)->url($tour));
    }

    public function test_the_program_pdf_and_the_travel_book_carry_the_map(): void
    {
        $tour = Tour::factory()->create(['route_stops' => self::STOPS]);
        $booking = Booking::factory()->create(['tour_id' => $tour->id, 'booking_type' => 'tour_booking']);

        $this->assertStringContainsString('<img class="route-map" src="data:image/png;base64,', app(TourPdfService::class)->html($tour));
        $this->assertStringContainsString('<img class="route-map" src="data:image/png;base64,', app(BookingTravelBook::class)->html($booking));

        $tour->update(['route_stops' => null]);
        $this->assertStringNotContainsString('route-map" src', app(TourPdfService::class)->html($tour->refresh()));
    }

    public function test_the_editor_previews_the_map_of_unsaved_stops(): void
    {
        $this->actingAsTourEditor();

        $response = $this->postJson('/api/admin/tours/route-map-preview', ['routeStops' => self::STOPS])->assertOk();

        $this->assertSame('image/png', $response->headers->get('content-type'));
        $this->assertSame(960, imagesx(imagecreatefromstring($response->getContent())));
        $this->postJson('/api/admin/tours/route-map-preview', ['routeStops' => []])->assertStatus(422);
    }

    public function test_the_editor_finds_places_with_hungarian_names(): void
    {
        $this->actingAsTourEditor();
        Http::fake(['nominatim.openstreetmap.org/*' => Http::response([
            ['name' => 'Belgrád', 'display_name' => 'Belgrád, Közép-Szerbia, Szerbia', 'lat' => '44.8153300', 'lon' => '20.4456600'],
        ])]);

        $this->getJson('/api/admin/tours/route-stop-places?q=Belgrád')
            ->assertOk()
            ->assertJsonPath('data.0', ['name' => 'Belgrád', 'description' => 'Belgrád, Közép-Szerbia, Szerbia', 'latitude' => 44.81533, 'longitude' => 20.44566]);

        Http::assertSent(fn ($request): bool => $request['accept-language'] === 'hu' && $request->hasHeader('User-Agent'));
    }

    public function test_a_failed_place_search_is_reported_and_not_cached(): void
    {
        $this->actingAsTourEditor();
        Http::fake(['nominatim.openstreetmap.org/*' => Http::response('', 500)]);

        $this->getJson('/api/admin/tours/route-stop-places?q=Ohrid')->assertStatus(503);
        $this->assertFalse(Cache::has('place-search:'.sha1('ohrid')));
    }

    public function test_stops_are_suggested_from_the_program_day_headings(): void
    {
        $this->actingAsTourEditor();
        $tour = Tour::factory()->create([
            'program' => '<p><strong>1. NAP BELGRÁD: világvárosi pezsgés</strong></p><p>Indulás a kora reggeli órákban.</p>'
                .'<p><strong>2. NAP SHKODER – DURRES: </strong>tengerpart</p><p>3. nap Indulás a kora reggeli órákban, hazaérkezés este.</p>',
        ]);

        $this->getJson("/api/admin/tours/{$tour->id}/route-stop-suggestions")
            ->assertOk()
            ->assertJsonPath('data', ['Belgrád', 'Shkoder', 'Durres']);
    }

    public function test_the_route_map_tools_need_the_tour_editor_permission(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/admin/tours/route-map-preview', ['routeStops' => self::STOPS])->assertForbidden();
        $this->getJson('/api/admin/tours/route-stop-places?q=Belgrád')->assertForbidden();
    }

    private function actingAsTourEditor(): void
    {
        Permission::findOrCreate('tours.update', 'web');
        $role = Role::findOrCreate('Route Map Test Editor', 'web');
        $role->syncPermissions(['tours.update']);

        $user = User::factory()->create();
        $user->assignRole($role);

        Sanctum::actingAs($user);
    }
}
