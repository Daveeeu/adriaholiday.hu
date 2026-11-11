<?php

namespace Tests\Feature;

use App\Mcp\Servers\AdriaHolidayServer;
use App\Mcp\Tools\GetApartmentTool;
use App\Mcp\Tools\GetBookingTool;
use App\Mcp\Tools\GetBusinessOverviewTool;
use App\Mcp\Tools\GetTourTool;
use App\Mcp\Tools\SearchAdminGuideTool;
use App\Mcp\Tools\SearchApartmentsTool;
use App\Mcp\Tools\SearchBookingsTool;
use App\Mcp\Tools\SearchCustomersTool;
use App\Mcp\Tools\SearchToursTool;
use App\Models\Apartment;
use App\Models\Booking;
use App\Models\Customer;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\User;
use App\Support\ActivityLog\ActivityEvents;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;
use Laravel\Passport\Passport;
use ReflectionClass;
use ReflectionProperty;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class McpServerTest extends TestCase
{
    use RefreshDatabase;

    private const MCP_HEADERS = ['Accept' => 'application/json, text/event-stream', 'MCP-Protocol-Version' => '2025-06-18'];

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo('2026-06-01 10:00:00');
        Storage::fake('public');
        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RolePermissionSeeder::class);
    }

    public function test_every_tool_is_read_only(): void
    {
        $tools = (new ReflectionProperty(AdriaHolidayServer::class, 'tools'))->getDefaultValue();

        $this->assertNotEmpty($tools);

        foreach ($tools as $tool) {
            $this->assertNotEmpty((new ReflectionClass($tool))->getAttributes(IsReadOnly::class), "{$tool} must be #[IsReadOnly].");
        }
    }

    public function test_tours_are_found_by_name_and_departure_with_price_and_links(): void
    {
        $tour = $this->tourWithDeparture('Montenegró és Albánia', '2026-07-10', '2026-07-15', 189900);
        $this->tourWithDeparture('Párizs', '2026-09-01', '2026-09-05', 150000);

        AdriaHolidayServer::actingAs($this->admin())
            ->tool(SearchToursTool::class, ['query' => 'montenegro', 'departure_from' => '2026-07-01', 'departure_to' => '2026-07-31'])
            ->assertOk()
            ->assertSee('"total_count":1')
            ->assertSee('"name":"Montenegró és Albánia"')
            ->assertSee('"start_date":"2026-07-10"')
            ->assertSee('"amount":189900.0')
            ->assertSee('/ajanlat/'.$tour->seo_name)
            ->assertDontSee('Párizs');
    }

    public function test_a_tour_shows_its_departures_booked_passengers_and_photos(): void
    {
        $tour = $this->tourWithDeparture('Montenegró és Albánia', '2026-07-10', '2026-07-15', 189900);
        $tour->addMedia(UploadedFile::fake()->image('kotor.jpg', 1600, 900))->toMediaCollection('slider');
        $date = $tour->dates()->first();
        $this->booking(['tour_id' => $tour->id, 'tour_date_id' => $date->id, 'status' => 'confirmed', 'passenger_count' => 3]);
        $this->booking(['tour_id' => $tour->id, 'tour_date_id' => $date->id, 'status' => 'new', 'passenger_count' => 2]);
        $this->booking(['tour_id' => $tour->id, 'tour_date_id' => $date->id, 'status' => 'confirmed', 'passenger_count' => 4, 'cancelled' => true]);

        $response = AdriaHolidayServer::actingAs($this->admin())->tool(GetTourTool::class, ['id' => $tour->id]);

        $response->assertOk()
            ->assertSee('"booked_passengers_by_status":{"Megerősítve":3,"Új":2}')
            ->assertSee('"image_url":"');
        $this->assertSame('image/webp', $this->contentOfType($response, 'image')[0]['mimeType']);
    }

    public function test_booked_passengers_stay_hidden_from_staff_who_may_not_see_bookings(): void
    {
        $tour = $this->tourWithDeparture('Párizs', '2026-07-10', '2026-07-15', 150000);

        AdriaHolidayServer::actingAs($this->staff(['tours.viewAny', 'tours.view']))
            ->tool(GetTourTool::class, ['slug' => $tour->seo_name, 'images' => 0])
            ->assertOk()
            ->assertSee('nincs jogosultság a foglalásokhoz');
    }

    public function test_bookings_are_filtered_and_one_booking_shows_its_details(): void
    {
        $match = $this->booking(['customer_name' => 'Kovács Anna', 'email' => 'anna@example.com', 'departure_date' => '2026-07-10', 'admin_note' => 'Ablak mellé kér helyet']);
        $this->booking(['customer_name' => 'Nagy Péter', 'email' => 'peter@example.com', 'departure_date' => '2026-07-12']);
        $this->booking(['customer_name' => 'Kovács Béla', 'departure_date' => '2026-07-10', 'cancelled' => true]);

        $user = $this->admin();

        AdriaHolidayServer::actingAs($user)
            ->tool(SearchBookingsTool::class, ['search' => 'Kovács', 'cancelled' => false, 'departure_from' => '2026-07-01'])
            ->assertOk()
            ->assertSee('"total_count":1')
            ->assertSee('"id":'.$match->id)
            ->assertSee('/admin/bookings/tour-bookings')
            ->assertDontSee('Nagy Péter');

        AdriaHolidayServer::actingAs($user)
            ->tool(GetBookingTool::class, ['id' => $match->id])
            ->assertOk()
            ->assertSee('"admin_note":"Ablak mellé kér helyet"')
            ->assertSee('"status_label":"Új"');
    }

    public function test_tools_of_data_the_staff_member_may_not_see_are_not_offered(): void
    {
        $booking = $this->booking();

        AdriaHolidayServer::actingAs($this->staff(['tours.viewAny', 'tours.view']))
            ->tool(GetBookingTool::class, ['id' => $booking->id])
            ->assertHasErrors();
    }

    public function test_customers_apartments_and_the_business_overview_are_answered(): void
    {
        Customer::query()->create(['email' => 'anna@example.com', 'name' => 'Kovács Anna', 'phone' => '+36 30 123 4567']);
        $apartment = Apartment::factory()->create(['name' => 'Dune Villa', 'slug' => 'dune-villa', 'code' => '101', 'is_active' => true, 'status' => Apartment::STATUS_PUBLISHED, 'max_guests' => 6]);
        $this->booking(['total_amount' => 300000, 'paid_amount' => 100000, 'passenger_count' => 2, 'offer_name_snapshot' => 'Róma']);
        $this->booking(['total_amount' => 200000, 'passenger_count' => 2, 'offer_name_snapshot' => 'Róma', 'cancelled' => true]);
        $user = $this->admin();

        AdriaHolidayServer::actingAs($user)->tool(SearchCustomersTool::class, ['search' => 'anna'])
            ->assertOk()->assertSee('"phone":"+36 30 123 4567"');

        AdriaHolidayServer::actingAs($user)->tool(SearchApartmentsTool::class, ['search' => 'dune'])
            ->assertOk()->assertSee('"max_guests":6');

        AdriaHolidayServer::actingAs($user)->tool(GetApartmentTool::class, ['id' => $apartment->id])
            ->assertOk()->assertSee('/apartman/dune-villa');

        AdriaHolidayServer::actingAs($user)->tool(GetBusinessOverviewTool::class, ['from' => '2026-01-01', 'to' => '2026-06-30'])
            ->assertOk()
            ->assertSee('"revenue":{"HUF":300000.0}')
            ->assertSee('"paid":{"HUF":100000.0}')
            ->assertSee('"cancelled":1');
    }

    public function test_the_admin_guide_answers_how_to_questions_with_screenshots(): void
    {
        $screenshots = Storage::disk('public')->path('guide-images');
        mkdir($screenshots, 0777, true);
        config(['mcp.guide_images_path' => $screenshots]);

        $guide = json_decode((string) file_get_contents(resource_path('user-guide/user-guide.json')), true);
        $topic = collect($guide['chapters'])->flatMap(fn (array $chapter): array => $chapter['topics'])
            ->first(fn (array $topic): bool => collect($topic['blocks'])->contains('type', 'image'));
        $image = collect($topic['blocks'])->firstWhere('type', 'image')['image']['file'];
        UploadedFile::fake()->image('shot.jpg', 400, 300)->move($screenshots, "{$image}.webp");

        $response = AdriaHolidayServer::actingAs($this->admin())->tool(SearchAdminGuideTool::class, ['topic_id' => $topic['id']]);

        $response->assertOk()->assertSee($topic['title'])->assertSee("guide-images/{$image}.webp");
        $this->assertCount(1, $this->contentOfType($response, 'image'));

        AdriaHolidayServer::actingAs($this->admin())->tool(SearchAdminGuideTool::class, [])
            ->assertOk()->assertSee('table_of_contents');
    }

    public function test_answering_questions_never_writes_to_the_database(): void
    {
        $tour = $this->tourWithDeparture('Montenegró és Albánia', '2026-07-10', '2026-07-15', 189900);
        $booking = $this->booking(['tour_id' => $tour->id]);
        $apartment = Apartment::factory()->create(['name' => 'Dune Villa', 'slug' => 'dune-villa', 'code' => '101', 'is_active' => true, 'status' => Apartment::STATUS_PUBLISHED]);
        $user = $this->admin();
        $writes = [];
        DB::listen(function ($query) use (&$writes): void {
            if (preg_match('/^\s*(insert|update|delete|replace|alter|drop|create)\b/i', $query->sql) === 1) {
                $writes[] = $query->sql;
            }
        });

        foreach ([
            [SearchToursTool::class, ['query' => 'albania']],
            [GetTourTool::class, ['id' => $tour->id, 'images' => 0]],
            [SearchBookingsTool::class, ['search' => 'a']],
            [GetBookingTool::class, ['id' => $booking->id]],
            [SearchCustomersTool::class, ['search' => 'anna']],
            [SearchApartmentsTool::class, []],
            [GetApartmentTool::class, ['id' => $apartment->id]],
            [GetBusinessOverviewTool::class, []],
            [SearchAdminGuideTool::class, ['query' => 'foglalás státusz', 'screenshots' => 0]],
        ] as [$tool, $arguments]) {
            AdriaHolidayServer::actingAs($user)->tool($tool, $arguments)->assertOk();
        }

        $this->assertSame([], $writes);
    }

    public function test_the_endpoint_asks_unauthenticated_clients_to_sign_in_with_oauth(): void
    {
        $this->postJson('/mcp', $this->rpc('tools/list'), self::MCP_HEADERS)
            ->assertUnauthorized()
            ->assertHeader('WWW-Authenticate');

        $this->getJson('/.well-known/oauth-protected-resource')->assertOk()->assertJsonPath('scopes_supported', ['mcp:use']);
        $this->getJson('/.well-known/oauth-authorization-server')->assertOk()->assertJsonPath('registration_endpoint', url('/oauth/register'));
    }

    public function test_only_active_staff_with_the_ai_permission_reach_the_server(): void
    {
        Passport::actingAs($this->staff(['tours.viewAny']));
        $this->postJson('/mcp', $this->rpc('tools/list'), self::MCP_HEADERS)->assertForbidden();

        $inactive = $this->admin();
        $inactive->forceFill(['is_active' => false])->save();
        Passport::actingAs($inactive);
        $this->postJson('/mcp', $this->rpc('tools/list'), self::MCP_HEADERS)->assertForbidden();
    }

    public function test_staff_see_only_their_tools_and_every_tool_call_is_logged(): void
    {
        $user = $this->staff(['mcp.access', 'tours.viewAny', 'tours.view']);
        Passport::actingAs($user);

        $tools = $this->postJson('/mcp', $this->rpc('tools/list'), self::MCP_HEADERS)->assertOk()->json('result.tools.*.name');
        sort($tools);
        $this->assertSame(['get_tour', 'search_admin_guide', 'search_tours'], $tools);

        $this->postJson('/mcp', $this->rpc('tools/call', ['name' => 'search_tours', 'arguments' => ['query' => 'Róma']]), self::MCP_HEADERS)->assertOk();

        $activity = Activity::query()->where('event', ActivityEvents::AI_QUERY)->sole();
        $this->assertTrue($activity->causer->is($user));
        $this->assertSame('search_tours', $activity->properties['tool']);
        $this->assertSame(['query' => 'Róma'], $activity->properties['arguments']);
    }

    public function test_an_assistant_connects_through_sign_in_consent_and_token_exchange(): void
    {
        $key = openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]);
        openssl_pkey_export($key, $privateKey);
        config(['passport.private_key' => $privateKey, 'passport.public_key' => openssl_pkey_get_details($key)['key']]);
        $callback = 'https://claude.ai/api/mcp/auth_callback';
        $clientId = $this->postJson('/oauth/register', ['client_name' => 'Claude', 'redirect_uris' => [$callback]])->assertCreated()->json('client_id');
        $verifier = Str::random(64);
        // In alphabetical order, as the intended URL is stored after sign-in.
        $authorize = '/oauth/authorize?'.http_build_query([
            'client_id' => $clientId,
            'code_challenge' => rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '='),
            'code_challenge_method' => 'S256',
            'redirect_uri' => $callback,
            'response_type' => 'code',
            'scope' => 'mcp:use',
            'state' => 'allapot',
        ]);

        $this->get($authorize)->assertRedirect(route('mcp.login'));

        $withoutPermission = $this->staff(['tours.viewAny']);
        $this->post(route('mcp.login.store'), ['email' => $withoutPermission->email, 'password' => 'password'])
            ->assertSessionHasErrors('email');
        $this->assertGuest('web');

        $admin = $this->admin();
        $this->post(route('mcp.login.store'), ['email' => $admin->email, 'password' => 'password'])->assertRedirect(url($authorize));
        $this->assertAuthenticatedAs($admin, 'web');

        $consent = $this->get($authorize)->assertOk()->assertSee('Claude hozzáférést kér')->assertSee('Engedélyezem');
        preg_match('/name="auth_token" value="([^"]+)"/', $consent->getContent(), $authToken);

        $redirect = $this->post('/oauth/authorize', ['auth_token' => $authToken[1]])->assertRedirect()->headers->get('Location');
        $this->assertStringStartsWith($callback, $redirect);
        parse_str((string) parse_url($redirect, PHP_URL_QUERY), $callbackQuery);
        $this->assertSame('allapot', $callbackQuery['state']);

        $accessToken = $this->postJson('/oauth/token', [
            'grant_type' => 'authorization_code',
            'client_id' => $clientId,
            'redirect_uri' => $callback,
            'code_verifier' => $verifier,
            'code' => $callbackQuery['code'],
        ])->assertOk()->json('access_token');

        $this->app['auth']->forgetGuards();
        $this->flushSession();

        $headers = [...self::MCP_HEADERS, 'Authorization' => "Bearer {$accessToken}"];
        $initialize = $this->postJson('/mcp', $this->rpc('initialize', [
            'protocolVersion' => '2025-06-18',
            'capabilities' => (object) [],
            'clientInfo' => ['name' => 'Claude', 'version' => '1.0'],
        ]), $headers)->assertOk();

        $initialize->assertJsonPath('result.serverInfo.name', 'Adria Holiday');
        $this->assertStringContainsString('Never guess or invent', $initialize->json('result.instructions'));

        $this->postJson('/mcp', $this->rpc('tools/list'), $headers)
            ->assertOk()
            ->assertJsonFragment(['name' => 'search_bookings']);
    }

    public function test_only_the_known_assistants_may_register_as_oauth_clients(): void
    {
        foreach ([
            'https://claude.ai/api/mcp/auth_callback',
            'https://chatgpt.com/connector_platform_oauth_redirect',
            'https://oauth-redirect.googleusercontent.com/r/user_bound_custom-mcp-123-adriaholiday_hu',
            'https://vertexaisearch.cloud.google.com/oauth-redirect',
        ] as $redirectUri) {
            $this->postJson('/oauth/register', ['client_name' => 'AI', 'redirect_uris' => [$redirectUri]])->assertCreated();
        }

        $this->postJson('/oauth/register', ['client_name' => 'Rossz', 'redirect_uris' => ['https://evil.example.com/callback']])
            ->assertStatus(400)
            ->assertJsonPath('error', 'invalid_redirect_uri');
    }

    private function admin(): User
    {
        return User::factory()->create(['is_active' => true])->assignRole('Admin');
    }

    /**
     * @param  array<int, string>  $permissions
     */
    private function staff(array $permissions): User
    {
        return User::factory()->create(['is_active' => true])->givePermissionTo($permissions);
    }

    private function tourWithDeparture(string $name, string $start, string $end, int $price): Tour
    {
        $tour = Tour::factory()->create(['name' => $name, 'active' => true, 'listed' => true, 'price' => $price]);
        TourDate::query()->create(['tour_id' => $tour->id, 'start_date' => $start, 'end_date' => $end, 'price' => $price, 'status' => 'available']);

        return $tour->refresh();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function booking(array $attributes = []): Booking
    {
        return Booking::query()->create([
            'booking_type' => 'tour_booking',
            'status' => 'new',
            'customer_name' => 'Teszt Utas',
            'email' => 'utas@example.com',
            'passenger_count' => 1,
            'cancelled' => false,
            'currency' => 'HUF',
            ...$attributes,
        ]);
    }

    /**
     * @param  array<string, mixed>  $params
     * @return array<string, mixed>
     */
    private function rpc(string $method, array $params = []): array
    {
        return ['jsonrpc' => '2.0', 'id' => 1, 'method' => $method, 'params' => (object) $params];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function contentOfType(mixed $response, string $type): array
    {
        $content = (fn () => $this->response->toArray()['result']['content'])->call($response);

        return array_values(array_filter($content, fn (array $item): bool => $item['type'] === $type));
    }
}
