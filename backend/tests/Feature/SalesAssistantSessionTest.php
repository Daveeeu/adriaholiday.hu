<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\TourDate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\Concerns\InteractsWithSalesAssistant;
use Tests\TestCase;

class SalesAssistantSessionTest extends TestCase
{
    use InteractsWithSalesAssistant;
    use RefreshDatabase;

    public function test_every_endpoint_is_hidden_while_the_feature_flag_is_off(): void
    {
        config(['sales_assistant.enabled' => false, 'sales_assistant.retell.api_key' => self::RETELL_TEST_KEY]);
        Http::fake();

        $this->getJson('/api/sales-assistant/status')->assertNotFound();
        $this->postJson('/api/sales-assistant/sessions')->assertNotFound();
        $this->deleteJson('/api/sales-assistant/sessions/current')->assertNotFound();
        $this->getJson('/api/sales-assistant/sessions/current/recommendations')->assertNotFound();
        $this->callRetellFunction('search_trips')->assertNotFound();

        Http::assertNothingSent();
    }

    public function test_the_retell_functions_work_while_the_demo_page_is_hidden(): void
    {
        $this->enableSalesAssistant(['demo_page_enabled' => false]);
        Http::fake();

        $this->getJson('/api/sales-assistant/status')->assertNotFound();
        $this->postJson('/api/sales-assistant/sessions')->assertNotFound();
        $this->getJson('/api/sales-assistant/sessions/current/recommendations')->assertNotFound();
        $this->callRetellFunction('search_trips')->assertOk()->assertJsonPath('total_matches', 0);

        Http::assertNothingSent();
    }

    public function test_status_reports_availability_and_access_code_requirement(): void
    {
        $this->enableSalesAssistant(['access_code' => 'demo-2026']);

        $this->getJson('/api/sales-assistant/status')
            ->assertOk()
            ->assertExactJson(['data' => ['available' => true, 'accessCodeRequired' => true, 'maxRecommendations' => 3]]);

        config(['sales_assistant.retell.agent_id' => null]);

        $this->getJson('/api/sales-assistant/status')->assertOk()->assertJsonPath('data.available', false);
    }

    public function test_starting_a_session_creates_a_web_call_with_the_server_key(): void
    {
        $this->enableSalesAssistant();
        $this->fakeRetellWebCalls('call_abc');

        $response = $this->postJson('/api/sales-assistant/sessions')
            ->assertCreated()
            ->assertJsonPath('data.call.callId', 'call_abc')
            ->assertJsonPath('data.call.accessToken', 'web_call_access_token')
            ->assertJsonPath('data.call.transport', 'gateway')
            ->assertJsonStructure(['data' => ['sessionToken', 'expiresAt', 'call' => ['accessTokenExpiresAt', 'url', 'iceServers']]]);

        $this->assertStringNotContainsString(self::RETELL_TEST_KEY, $response->getContent());
        $this->assertSame(64, strlen((string) $response->json('data.sessionToken')));

        Http::assertSent(fn (Request $request): bool => $request->url() === 'https://api.retellai.com/v3/create-web-call'
            && $request->hasHeader('Authorization', 'Bearer '.self::RETELL_TEST_KEY)
            && $request['agent_id'] === self::RETELL_TEST_AGENT
            && $request['metadata'] === ['source' => 'adriaholiday-sales-assistant-demo']);
    }

    public function test_the_browser_cannot_choose_the_agent(): void
    {
        $this->enableSalesAssistant();
        $this->fakeRetellWebCalls();

        $this->postJson('/api/sales-assistant/sessions', ['agent_id' => 'agent_someone_else'])->assertCreated();

        Http::assertSent(fn (Request $request): bool => $request['agent_id'] === self::RETELL_TEST_AGENT);
    }

    public function test_a_session_cannot_be_started_without_the_access_code(): void
    {
        $this->enableSalesAssistant(['access_code' => 'demo-2026']);
        $this->fakeRetellWebCalls();

        $this->postJson('/api/sales-assistant/sessions')->assertForbidden()->assertJsonPath('message', 'Érvénytelen hozzáférési kód.');
        $this->postJson('/api/sales-assistant/sessions', ['accessCode' => 'wrong'])->assertForbidden();
        $this->postJson('/api/sales-assistant/sessions', ['accessCode' => ['demo-2026']])->assertForbidden();
        Http::assertNothingSent();

        $this->postJson('/api/sales-assistant/sessions', ['accessCode' => 'demo-2026'])->assertCreated();
    }

    public function test_a_session_cannot_be_started_without_retell_credentials(): void
    {
        $this->enableSalesAssistant(['retell.api_key' => '']);
        Http::fake();

        $this->postJson('/api/sales-assistant/sessions')
            ->assertStatus(503)
            ->assertJsonPath('error.code', 'not_configured');

        Http::assertNothingSent();
    }

    public function test_a_retell_failure_is_reported_without_details_and_does_not_use_up_the_day(): void
    {
        $this->enableSalesAssistant(['daily_session_limit' => 1]);
        Http::fake([
            'api.retellai.com/v3/create-web-call' => Http::sequence()
                ->push(['status' => 'error', 'message' => 'agent_test_adria not found'], 404)
                ->push(['call_id' => 'call_ok', 'access_token' => 'token'], 201),
        ]);

        $response = $this->postJson('/api/sales-assistant/sessions')
            ->assertStatus(502)
            ->assertJsonPath('error.code', 'upstream_failed');
        $this->assertStringNotContainsString('not found', $response->getContent());

        $this->postJson('/api/sales-assistant/sessions')->assertCreated();
    }

    public function test_the_daily_session_limit_caps_new_conversations(): void
    {
        $this->enableSalesAssistant(['daily_session_limit' => 2]);
        $this->fakeRetellWebCalls();

        $this->postJson('/api/sales-assistant/sessions')->assertCreated();
        $this->postJson('/api/sales-assistant/sessions')->assertCreated();
        $this->postJson('/api/sales-assistant/sessions')
            ->assertStatus(503)
            ->assertJsonPath('error.code', 'daily_limit_reached');

        $this->travelTo(now()->addDay()->startOfDay()->addHour());

        $this->postJson('/api/sales-assistant/sessions')->assertCreated();
    }

    public function test_one_ip_address_can_only_start_a_few_conversations_an_hour(): void
    {
        $this->enableSalesAssistant(['sessions_per_ip_per_hour' => 2]);
        $this->fakeRetellWebCalls();

        $this->postJson('/api/sales-assistant/sessions')->assertCreated();
        $this->postJson('/api/sales-assistant/sessions')->assertCreated();
        $this->postJson('/api/sales-assistant/sessions')->assertTooManyRequests();
    }

    public function test_recommendations_need_a_live_session(): void
    {
        $this->enableSalesAssistant();

        $this->getJson('/api/sales-assistant/sessions/current/recommendations')
            ->assertUnauthorized()
            ->assertJsonPath('error.code', 'session_invalid');

        $this->withHeader('X-Assistant-Session', 'not-a-real-session-token')
            ->getJson('/api/sales-assistant/sessions/current/recommendations')
            ->assertUnauthorized();
        $this->withHeader('X-Assistant-Session', str_repeat('a', 500))
            ->getJson('/api/sales-assistant/sessions/current/recommendations')
            ->assertUnauthorized();
    }

    public function test_the_session_shows_the_trips_its_call_talks_about(): void
    {
        $this->travelTo('2026-06-01 10:00:00');
        $this->enableSalesAssistant();
        $tour = Tour::factory()->create(['seo_name' => 'dalmat-kor', 'name' => 'Dalmát kör']);
        TourDate::factory()->create(['tour_id' => $tour->id, 'start_date' => '2026-07-10', 'end_date' => '2026-07-15']);
        Http::fake([
            'api.retellai.com/v3/create-web-call' => Http::sequence()
                ->push(['call_id' => 'call_mine', 'access_token' => 'token'], 201)
                ->push(['call_id' => 'call_other', 'access_token' => 'token'], 201),
        ]);
        $mine = (string) $this->postJson('/api/sales-assistant/sessions')->json('data.sessionToken');
        $other = (string) $this->postJson('/api/sales-assistant/sessions')->json('data.sessionToken');

        $this->callRetellFunction('get_trip_details', ['slug' => 'dalmat-kor'], ['call_id' => 'call_mine'])->assertOk();

        $this->withHeader('X-Assistant-Session', $mine)
            ->getJson('/api/sales-assistant/sessions/current/recommendations')
            ->assertOk()
            ->assertJsonPath('data.trips.0.seoName', 'dalmat-kor')
            ->assertJsonPath('data.trips.0.link', '/ajanlat/dalmat-kor');

        $this->withHeader('X-Assistant-Session', $other)
            ->getJson('/api/sales-assistant/sessions/current/recommendations')
            ->assertOk()
            ->assertJsonPath('data.trips', []);
    }

    public function test_an_ended_session_can_no_longer_follow_its_call(): void
    {
        $this->enableSalesAssistant();
        $token = $this->startAssistantSession();

        $this->withHeader('X-Assistant-Session', $token)->getJson('/api/sales-assistant/sessions/current/recommendations')->assertOk();
        $this->withHeader('X-Assistant-Session', $token)->deleteJson('/api/sales-assistant/sessions/current')->assertNoContent();

        $this->withHeader('X-Assistant-Session', $token)->getJson('/api/sales-assistant/sessions/current/recommendations')->assertUnauthorized();
        $this->withHeader('X-Assistant-Session', $token)->deleteJson('/api/sales-assistant/sessions/current')->assertUnauthorized();
    }

    public function test_an_expired_session_can_no_longer_follow_its_call(): void
    {
        $this->enableSalesAssistant(['session_ttl_seconds' => 300]);
        $token = $this->startAssistantSession();

        $this->travel(299)->seconds();
        $this->withHeader('X-Assistant-Session', $token)->getJson('/api/sales-assistant/sessions/current/recommendations')->assertOk();

        $this->travel(2)->seconds();
        $this->withHeader('X-Assistant-Session', $token)
            ->getJson('/api/sales-assistant/sessions/current/recommendations')
            ->assertUnauthorized()
            ->assertJsonPath('error.code', 'session_invalid');
    }

    public function test_function_calls_store_nothing_about_the_conversation(): void
    {
        $this->enableSalesAssistant();
        $tables = ['activity_log', 'analytics_events', 'bookings', 'contact_messages', 'newsletter_subscribers'];
        $countsBefore = collect($tables)->mapWithKeys(fn (string $table): array => [$table => DB::table($table)->count()])->all();

        $this->callRetellFunction('search_trips', ['query' => 'Horvátország'])->assertOk();

        foreach ($countsBefore as $table => $count) {
            $this->assertDatabaseCount($table, $count);
        }
    }
}
