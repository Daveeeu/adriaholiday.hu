<?php

namespace Tests\Feature;

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
        config(['sales_assistant.enabled' => false, 'sales_assistant.openai.api_key' => self::OPENAI_TEST_KEY]);
        Http::fake();

        $this->getJson('/api/sales-assistant/status')->assertNotFound();
        $this->postJson('/api/sales-assistant/sessions')->assertNotFound();
        $this->postJson('/api/sales-assistant/tools/search_trips', ['arguments' => []])->assertNotFound();
        $this->deleteJson('/api/sales-assistant/sessions/current')->assertNotFound();

        Http::assertNothingSent();
    }

    public function test_status_reports_availability_and_access_code_requirement(): void
    {
        $this->enableSalesAssistant(['access_code' => 'demo-2026']);

        $this->getJson('/api/sales-assistant/status')
            ->assertOk()
            ->assertExactJson(['data' => ['available' => true, 'accessCodeRequired' => true, 'maxRecommendations' => 3]]);

        config(['sales_assistant.openai.api_key' => null]);

        $this->getJson('/api/sales-assistant/status')->assertOk()->assertJsonPath('data.available', false);
    }

    public function test_starting_a_session_mints_a_short_lived_secret_with_the_server_key(): void
    {
        $this->enableSalesAssistant();
        $this->fakeOpenAiClientSecrets();

        $response = $this->postJson('/api/sales-assistant/sessions')
            ->assertCreated()
            ->assertJsonPath('data.clientSecret', 'ek_test_client_secret')
            ->assertJsonPath('data.model', config('sales_assistant.openai.model'))
            ->assertJsonStructure(['data' => ['sessionToken', 'expiresAt', 'clientSecret', 'clientSecretExpiresAt', 'model']]);

        $this->assertStringNotContainsString(self::OPENAI_TEST_KEY, $response->getContent());
        $this->assertSame(64, strlen((string) $response->json('data.sessionToken')));

        Http::assertSent(function (Request $request): bool {
            $session = $request['session'];

            return $request->hasHeader('Authorization', 'Bearer '.self::OPENAI_TEST_KEY)
                && $request['expires_after']['seconds'] <= 600
                && $session['type'] === 'realtime'
                && $session['audio']['input']['transcription']['language'] === 'hu'
                && str_contains($session['instructions'], 'Hungarian')
                && collect($session['tools'])->pluck('name')->sort()->values()->all() === [
                    'get_pickup_locations', 'get_trip_departures', 'get_trip_details', 'get_trip_price', 'search_trips',
                ];
        });
    }

    public function test_a_session_cannot_be_started_without_the_access_code(): void
    {
        $this->enableSalesAssistant(['access_code' => 'demo-2026']);
        $this->fakeOpenAiClientSecrets();

        $this->postJson('/api/sales-assistant/sessions')->assertForbidden()->assertJsonPath('message', 'Érvénytelen hozzáférési kód.');
        $this->postJson('/api/sales-assistant/sessions', ['accessCode' => 'wrong'])->assertForbidden();
        $this->postJson('/api/sales-assistant/sessions', ['accessCode' => ['demo-2026']])->assertForbidden();
        Http::assertNothingSent();

        $this->postJson('/api/sales-assistant/sessions', ['accessCode' => 'demo-2026'])->assertCreated();
    }

    public function test_a_session_cannot_be_started_without_an_openai_key(): void
    {
        $this->enableSalesAssistant(['openai.api_key' => '']);
        Http::fake();

        $this->postJson('/api/sales-assistant/sessions')
            ->assertStatus(503)
            ->assertJsonPath('error.code', 'not_configured');

        Http::assertNothingSent();
    }

    public function test_an_openai_failure_is_reported_without_details_and_does_not_use_up_the_day(): void
    {
        $this->enableSalesAssistant(['daily_session_limit' => 1]);
        Http::fake([
            'api.openai.com/v1/realtime/client_secrets' => Http::sequence()
                ->push(['error' => ['message' => 'upstream failure']], 500)
                ->push(['value' => 'ek_test_client_secret', 'expires_at' => now()->addMinutes(2)->getTimestamp()]),
        ]);

        $response = $this->postJson('/api/sales-assistant/sessions')
            ->assertStatus(502)
            ->assertJsonPath('error.code', 'upstream_failed');
        $this->assertStringNotContainsString('upstream failure', $response->getContent());

        $this->postJson('/api/sales-assistant/sessions')->assertCreated();
    }

    public function test_the_daily_session_limit_caps_new_conversations(): void
    {
        $this->enableSalesAssistant(['daily_session_limit' => 2]);
        $this->fakeOpenAiClientSecrets();

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
        $this->fakeOpenAiClientSecrets();

        $this->postJson('/api/sales-assistant/sessions')->assertCreated();
        $this->postJson('/api/sales-assistant/sessions')->assertCreated();
        $this->postJson('/api/sales-assistant/sessions')->assertTooManyRequests();
    }

    public function test_tools_refuse_calls_without_a_live_session(): void
    {
        $this->enableSalesAssistant();

        $this->postJson('/api/sales-assistant/tools/search_trips', ['arguments' => []])
            ->assertUnauthorized()
            ->assertJsonPath('error.code', 'session_invalid');

        $this->callAssistantTool('not-a-real-session-token', 'search_trips')->assertUnauthorized();
        $this->callAssistantTool(str_repeat('a', 500), 'search_trips')->assertUnauthorized();
    }

    public function test_an_ended_session_can_no_longer_call_tools(): void
    {
        $this->enableSalesAssistant();
        $token = $this->startAssistantSession();

        $this->callAssistantTool($token, 'search_trips')->assertOk();

        $this->withHeader('X-Assistant-Session', $token)->deleteJson('/api/sales-assistant/sessions/current')->assertNoContent();

        $this->callAssistantTool($token, 'search_trips')->assertUnauthorized();
        $this->withHeader('X-Assistant-Session', $token)->deleteJson('/api/sales-assistant/sessions/current')->assertUnauthorized();
    }

    public function test_an_expired_session_can_no_longer_call_tools(): void
    {
        $this->enableSalesAssistant(['session_ttl_seconds' => 300]);
        $token = $this->startAssistantSession();

        $this->travel(299)->seconds();
        $this->callAssistantTool($token, 'search_trips')->assertOk();

        $this->travel(2)->seconds();
        $this->callAssistantTool($token, 'search_trips')
            ->assertUnauthorized()
            ->assertJsonPath('error.code', 'session_invalid');
    }

    public function test_a_session_runs_out_of_tool_calls(): void
    {
        $this->enableSalesAssistant(['max_tool_calls_per_session' => 2]);
        $token = $this->startAssistantSession();

        $this->callAssistantTool($token, 'search_trips')->assertOk();
        $this->callAssistantTool($token, 'search_trips')->assertOk();
        $this->callAssistantTool($token, 'search_trips')
            ->assertTooManyRequests()
            ->assertJsonPath('error.code', 'tool_budget_exhausted');
    }

    public function test_tool_calls_store_nothing_about_the_conversation(): void
    {
        $this->enableSalesAssistant();
        $token = $this->startAssistantSession();
        $tables = ['activity_log', 'analytics_events', 'bookings', 'contact_messages', 'newsletter_subscribers'];
        $countsBefore = collect($tables)->mapWithKeys(fn (string $table): array => [$table => DB::table($table)->count()])->all();

        $this->callAssistantTool($token, 'search_trips', ['query' => 'Horvátország'])->assertOk();

        foreach ($countsBefore as $table => $count) {
            $this->assertDatabaseCount($table, $count);
        }
    }
}
