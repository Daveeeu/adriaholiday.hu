<?php

namespace App\Services\SalesAssistant;

use Carbon\CarbonImmutable;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Log;

/**
 * Mints short-lived OpenAI Realtime client secrets. The browser uses the
 * secret once, to open its WebRTC connection; the permanent API key never
 * leaves the server.
 */
class OpenAiRealtimeClient
{
    /**
     * How long the browser has to open the connection with a secret, in
     * seconds. The conversation itself is bounded by the assistant session.
     */
    private const CLIENT_SECRET_TTL_SECONDS = 120;

    public function __construct(private readonly HttpFactory $http) {}

    public function isConfigured(): bool
    {
        return $this->apiKey() !== '';
    }

    /**
     * @param  array<string, mixed>  $session  the Realtime session configuration
     * @return array{value: string, expiresAt: CarbonImmutable}
     *
     * @throws SalesAssistantException when OpenAI is unreachable or refuses
     */
    public function createClientSecret(array $session): array
    {
        try {
            $response = $this->http
                ->withToken($this->apiKey())
                ->asJson()
                ->acceptJson()
                ->timeout((int) config('sales_assistant.openai.timeout'))
                ->post(rtrim((string) config('sales_assistant.openai.base_url'), '/').'/realtime/client_secrets', [
                    'expires_after' => ['anchor' => 'created_at', 'seconds' => self::CLIENT_SECRET_TTL_SECONDS],
                    'session' => $session,
                ])
                ->throw();
        } catch (ConnectionException|RequestException $exception) {
            // The response body names the problem (e.g. an unknown model); it never echoes the key.
            Log::error('OpenAI Realtime client secret request failed.', [
                'status' => $exception instanceof RequestException ? $exception->response->status() : null,
                'body' => $exception instanceof RequestException ? mb_substr($exception->response->body(), 0, 500) : $exception->getMessage(),
            ]);

            throw SalesAssistantException::upstreamFailed();
        }

        $value = $response->json('value');
        $expiresAt = $response->json('expires_at');

        if (! is_string($value) || $value === '' || ! is_numeric($expiresAt)) {
            Log::error('OpenAI Realtime client secret response is malformed.');

            throw SalesAssistantException::upstreamFailed();
        }

        return [
            'value' => $value,
            'expiresAt' => CarbonImmutable::createFromTimestamp((int) $expiresAt),
        ];
    }

    private function apiKey(): string
    {
        return trim((string) config('sales_assistant.openai.api_key'));
    }
}
