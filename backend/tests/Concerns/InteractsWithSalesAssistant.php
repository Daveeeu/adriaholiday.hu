<?php

namespace Tests\Concerns;

use App\Support\SalesAssistant\RetellSignature;
use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;

/**
 * Turns the AI sales assistant demo on with a fake Retell API, and calls its
 * endpoints the way the demo page and Retell's servers do.
 */
trait InteractsWithSalesAssistant
{
    protected const RETELL_TEST_KEY = 'key_test_server_secret';

    protected const RETELL_TEST_AGENT = 'agent_test_adria';

    protected function enableSalesAssistant(array $config = []): void
    {
        config([
            'sales_assistant.enabled' => true,
            'sales_assistant.demo_page_enabled' => true,
            'sales_assistant.access_code' => null,
            'sales_assistant.retell.api_key' => self::RETELL_TEST_KEY,
            'sales_assistant.retell.agent_id' => self::RETELL_TEST_AGENT,
            ...collect($config)->mapWithKeys(fn (mixed $value, string $key): array => ["sales_assistant.{$key}" => $value])->all(),
        ]);
    }

    protected function fakeRetellWebCalls(string $callId = 'call_test_1'): void
    {
        Http::fake([
            'api.retellai.com/v3/create-web-call' => Http::response([
                'call_id' => $callId,
                'access_token' => 'web_call_access_token',
                'transport' => 'gateway',
                'ice_servers' => [['urls' => 'stun:stun.example.test:3478']],
                'expires_at' => now()->addSeconds(30)->getTimestampMs(),
            ], 201),
        ]);
    }

    protected function startAssistantSession(string $callId = 'call_test_1'): string
    {
        $this->fakeRetellWebCalls($callId);

        return (string) $this->postJson('/api/sales-assistant/sessions')->assertCreated()->json('data.sessionToken');
    }

    /**
     * Calls a custom function as Retell does: the call next to the
     * arguments, signed with the API key over the raw body.
     *
     * @param  array<string, mixed>  $arguments
     * @param  array<string, mixed>  $call
     */
    protected function callRetellFunction(string $tool, array $arguments = [], array $call = [], ?string $signingKey = null): TestResponse
    {
        $body = (string) json_encode([
            'name' => $tool,
            'call' => ['call_id' => 'call_test_1', 'agent_id' => self::RETELL_TEST_AGENT, 'call_type' => 'web_call', ...$call],
            'args' => (object) $arguments,
        ]);

        return $this->call('POST', "/api/sales-assistant/retell/functions/{$tool}", [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_ACCEPT' => 'application/json',
            'HTTP_X_RETELL_SIGNATURE' => RetellSignature::sign($body, $signingKey ?? self::RETELL_TEST_KEY, now()->getTimestampMs()),
        ], $body);
    }
}
