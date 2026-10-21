<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\TourDate;
use App\Support\SalesAssistant\RetellSignature;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Exceptions;
use Illuminate\Support\Facades\Log;
use Illuminate\Testing\TestResponse;
use Tests\Concerns\InteractsWithSalesAssistant;
use Tests\TestCase;

class SalesAssistantRetellFunctionsTest extends TestCase
{
    use InteractsWithSalesAssistant;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->travelTo('2026-06-01 10:00:00');
        $this->enableSalesAssistant();
    }

    public function test_a_signed_call_of_the_agent_gets_the_tool_result(): void
    {
        $this->trip('horvat-kor');

        $this->callRetellFunction('search_trips', ['query' => 'horvat-kor'])
            ->assertOk()
            ->assertJsonPath('total_matches', 1)
            ->assertJsonPath('trips.0.slug', 'horvat-kor')
            ->assertJsonMissingPath('data');
    }

    public function test_unsigned_or_badly_signed_calls_are_refused(): void
    {
        $body = (string) json_encode(['name' => 'search_trips', 'call' => ['call_id' => 'c', 'agent_id' => self::RETELL_TEST_AGENT], 'args' => []]);
        $now = now()->getTimestampMs();

        $this->signed($body, null)->assertUnauthorized();
        $this->signed($body, 'garbage')->assertUnauthorized();
        $this->signed($body, RetellSignature::sign($body, 'key_someone_else', $now))->assertUnauthorized();
        $this->signed($body, RetellSignature::sign($body.' ', self::RETELL_TEST_KEY, $now))->assertUnauthorized();
        $this->signed($body, RetellSignature::sign($body, self::RETELL_TEST_KEY, $now - 301_000))->assertUnauthorized();

        $this->signed($body, RetellSignature::sign($body, self::RETELL_TEST_KEY, $now))->assertOk();
    }

    public function test_every_function_endpoint_requires_a_signature_and_the_own_agent(): void
    {
        Log::spy();

        foreach (['search_trips', 'get_trip_details', 'get_trip_departures', 'get_pickup_locations', 'get_trip_price'] as $tool) {
            $this->postJson("/api/sales-assistant/retell/functions/{$tool}", ['call' => ['call_id' => 'c', 'agent_id' => self::RETELL_TEST_AGENT], 'args' => []])
                ->assertUnauthorized();
            $this->callRetellFunction($tool, [], ['agent_id' => 'agent_someone_else'])->assertForbidden();
        }

        Log::shouldHaveReceived('warning')
            ->with('Retell function call rejected: invalid signature.', \Mockery::on(fn (array $context): bool => $context['signature_present'] === false
                && $context['key_configured'] === true
                && ! array_key_exists('body', $context)))
            ->times(5);
    }

    public function test_expected_function_errors_are_not_written_to_the_error_log(): void
    {
        Exceptions::fake();

        $this->callRetellFunction('get_trip_price', ['slug' => 'x', 'passengers' => 0])->assertOk()->assertJsonPath('error.code', 'invalid_arguments');
        $this->callRetellFunction('get_trip_details', ['slug' => 'nincs-ilyen'])->assertOk()->assertJsonPath('error.code', 'trip_not_found');

        Exceptions::assertNothingReported();
    }

    public function test_calls_are_refused_while_no_retell_key_is_configured(): void
    {
        config(['sales_assistant.retell.api_key' => '']);
        $body = '{"name":"search_trips","call":{"call_id":"c","agent_id":"agent_test_adria"},"args":{}}';

        $this->signed($body, RetellSignature::sign($body, '', now()->getTimestampMs()))->assertUnauthorized();
    }

    public function test_calls_of_another_agent_are_refused(): void
    {
        $this->callRetellFunction('search_trips', [], ['agent_id' => 'agent_someone_else'])
            ->assertForbidden()
            ->assertJsonPath('message', 'Unknown agent.');

        $this->callRetellFunction('search_trips', [], ['agent_id' => null])->assertForbidden();
    }

    public function test_the_payload_must_carry_the_call_and_the_arguments(): void
    {
        foreach ([
            ['name' => 'search_trips', 'call' => ['agent_id' => self::RETELL_TEST_AGENT], 'args' => []],
            ['name' => 'search_trips', 'call' => ['call_id' => 'c', 'agent_id' => self::RETELL_TEST_AGENT]],
            ['name' => 'get_trip_details', 'call' => ['call_id' => 'c', 'agent_id' => self::RETELL_TEST_AGENT], 'args' => []],
        ] as $payload) {
            $body = (string) json_encode($payload);

            $this->signed($body, RetellSignature::sign($body, self::RETELL_TEST_KEY, now()->getTimestampMs()))
                ->assertOk()
                ->assertJsonPath('error.code', 'invalid_arguments');
        }
    }

    public function test_a_call_runs_out_of_function_calls(): void
    {
        config(['sales_assistant.max_tool_calls_per_session' => 2]);

        $this->callRetellFunction('search_trips')->assertOk()->assertJsonMissingPath('error');
        $this->callRetellFunction('search_trips')->assertOk()->assertJsonMissingPath('error');
        $this->callRetellFunction('search_trips')->assertOk()->assertJsonPath('error.code', 'tool_budget_exhausted');

        // Another call has its own budget.
        $this->callRetellFunction('search_trips', [], ['call_id' => 'call_test_2'])->assertOk()->assertJsonMissingPath('error');
    }

    public function test_function_calls_are_rate_limited_per_call(): void
    {
        config(['sales_assistant.max_tool_calls_per_session' => 1000]);

        foreach (range(1, 30) as $ignored) {
            $this->callRetellFunction('search_trips')->assertOk();
        }

        $this->callRetellFunction('search_trips')->assertTooManyRequests();
        $this->callRetellFunction('search_trips', [], ['call_id' => 'call_test_2'])->assertOk();
    }

    public function test_a_search_replaces_the_cards_and_a_question_brings_a_trip_to_the_front(): void
    {
        $token = $this->startAssistantSession();
        foreach (['a-ut', 'b-ut', 'c-ut', 'd-ut'] as $index => $slug) {
            $this->trip($slug, ['sort_order' => $index + 1]);
        }

        $this->callRetellFunction('search_trips')->assertOk();
        $this->assertSame(['a-ut', 'b-ut', 'c-ut'], $this->cards($token));

        $this->callRetellFunction('get_trip_details', ['slug' => 'c-ut'])->assertOk();
        $this->assertSame(['c-ut', 'a-ut', 'b-ut'], $this->cards($token));

        $this->callRetellFunction('get_trip_price', ['slug' => 'd-ut', 'passengers' => 2, 'departure_id' => Tour::query()->where('seo_name', 'd-ut')->firstOrFail()->dates()->value('id')])->assertOk();
        $this->assertSame(['d-ut', 'c-ut', 'a-ut'], $this->cards($token));

        $this->callRetellFunction('search_trips', ['query' => 'nincs ilyen'])->assertOk();
        $this->assertSame([], $this->cards($token));
    }

    public function test_cards_leave_out_trips_no_longer_offered(): void
    {
        $token = $this->startAssistantSession();
        $tour = $this->trip('megszuno');

        $this->callRetellFunction('get_trip_details', ['slug' => 'megszuno'])->assertOk();
        $tour->update(['active' => false]);

        $this->assertSame([], $this->cards($token));
    }

    private function signed(string $body, ?string $signature): TestResponse
    {
        return $this->call('POST', '/api/sales-assistant/retell/functions/search_trips', [], [], [], array_filter([
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_X_RETELL_SIGNATURE' => $signature,
        ]), $body);
    }

    /**
     * @return array<int, string>
     */
    private function cards(string $token): array
    {
        return $this->withHeader('X-Assistant-Session', $token)
            ->getJson('/api/sales-assistant/sessions/current/recommendations')
            ->assertOk()
            ->json('data.trips.*.seoName');
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function trip(string $slug, array $attributes = []): Tour
    {
        $tour = Tour::factory()->create(['name' => $slug, 'seo_name' => $slug, 'short_description' => '', 'list_description' => '', 'notes' => '', ...$attributes]);
        TourDate::factory()->create(['tour_id' => $tour->id, 'start_date' => '2026-07-10', 'end_date' => '2026-07-15', 'price' => 100000]);

        return $tour;
    }
}
