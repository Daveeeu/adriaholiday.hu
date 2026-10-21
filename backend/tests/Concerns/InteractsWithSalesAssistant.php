<?php

namespace Tests\Concerns;

use Illuminate\Support\Facades\Http;
use Illuminate\Testing\TestResponse;

/**
 * Turns the AI sales assistant demo on with a fake OpenAI API, and calls its
 * endpoints the way the demo page does.
 */
trait InteractsWithSalesAssistant
{
    protected const OPENAI_TEST_KEY = 'sk-test-server-key';

    protected function enableSalesAssistant(array $config = []): void
    {
        config([
            'sales_assistant.enabled' => true,
            'sales_assistant.access_code' => null,
            'sales_assistant.openai.api_key' => self::OPENAI_TEST_KEY,
            ...collect($config)->mapWithKeys(fn (mixed $value, string $key): array => ["sales_assistant.{$key}" => $value])->all(),
        ]);
    }

    protected function fakeOpenAiClientSecrets(): void
    {
        Http::fake([
            'api.openai.com/v1/realtime/client_secrets' => Http::response([
                'value' => 'ek_test_client_secret',
                'expires_at' => now()->addMinutes(2)->getTimestamp(),
                'session' => ['type' => 'realtime'],
            ]),
        ]);
    }

    protected function startAssistantSession(): string
    {
        $this->fakeOpenAiClientSecrets();

        return (string) $this->postJson('/api/sales-assistant/sessions')->assertCreated()->json('data.sessionToken');
    }

    /**
     * @param  array<string, mixed>  $arguments
     */
    protected function callAssistantTool(string $token, string $tool, array $arguments = []): TestResponse
    {
        return $this->withHeader('X-Assistant-Session', $token)
            ->postJson("/api/sales-assistant/tools/{$tool}", ['arguments' => (object) $arguments]);
    }
}
