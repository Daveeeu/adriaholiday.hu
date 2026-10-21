<?php

namespace App\Services\SalesAssistant;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Log;

/**
 * Creates the browser's web calls with the configured Retell agent. The
 * Retell API key never leaves the server: the browser joins the call with
 * the short-lived access token Retell answers with.
 */
class RetellClient
{
    public function __construct(private readonly HttpFactory $http) {}

    public function isConfigured(): bool
    {
        return $this->apiKey() !== '' && $this->agentId() !== '';
    }

    public function apiKey(): string
    {
        return trim((string) config('sales_assistant.retell.api_key'));
    }

    public function agentId(): string
    {
        return trim((string) config('sales_assistant.retell.agent_id'));
    }

    /**
     * @param  array<string, mixed>  $metadata  stored with the call by Retell
     * @return array{call_id: string, access_token: string, transport: string|null, url: string|null, ice_servers: array<int, mixed>|null, expires_at: int|null}
     *
     * @throws SalesAssistantException when Retell is unreachable or refuses
     */
    public function createWebCall(array $metadata): array
    {
        try {
            $response = $this->http
                ->withToken($this->apiKey())
                ->asJson()
                ->acceptJson()
                ->timeout((int) config('sales_assistant.retell.timeout'))
                ->post(rtrim((string) config('sales_assistant.retell.base_url'), '/').'/v3/create-web-call', [
                    'agent_id' => $this->agentId(),
                    'metadata' => $metadata,
                    'retell_llm_dynamic_variables' => (object) [],
                ])
                ->throw();
        } catch (ConnectionException|RequestException $exception) {
            // Retell's error body names the problem (e.g. an unknown agent); it never echoes the key.
            Log::error('Retell web call creation failed.', [
                'status' => $exception instanceof RequestException ? $exception->response->status() : null,
                'body' => $exception instanceof RequestException ? mb_substr($exception->response->body(), 0, 500) : $exception->getMessage(),
            ]);

            throw SalesAssistantException::upstreamFailed();
        }

        $callId = $response->json('call_id');
        $accessToken = $response->json('access_token');

        if (! is_string($callId) || $callId === '' || ! is_string($accessToken) || $accessToken === '') {
            Log::error('Retell web call response is malformed.');

            throw SalesAssistantException::upstreamFailed();
        }

        return [
            'call_id' => $callId,
            'access_token' => $accessToken,
            'transport' => is_string($response->json('transport')) ? $response->json('transport') : null,
            'url' => is_string($response->json('url')) ? $response->json('url') : null,
            'ice_servers' => is_array($response->json('ice_servers')) ? $response->json('ice_servers') : null,
            'expires_at' => is_numeric($response->json('expires_at')) ? (int) $response->json('expires_at') : null,
        ];
    }
}
