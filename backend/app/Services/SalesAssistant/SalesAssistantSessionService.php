<?php

namespace App\Services\SalesAssistant;

use App\Services\SalesAssistant\Tools\SalesAssistantTool;
use App\Services\SalesAssistant\Tools\SalesAssistantToolResult;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Cache\Repository as Cache;

/**
 * Starts and ends assistant conversations and answers the agent's function
 * calls. A conversation is a Retell web call the backend creates (the
 * browser joins it with a short-lived access token) plus an assistant
 * session the browser follows the recommended trips with. The number of
 * conversations a day is capped, since each one costs Retell usage.
 */
class SalesAssistantSessionService
{
    public function __construct(
        private readonly RetellClient $retell,
        private readonly SalesAssistantSessionStore $sessions,
        private readonly SalesAssistantCallStore $calls,
        private readonly SalesAssistantToolRegistry $tools,
        private readonly Cache $cache,
    ) {}

    public function isAvailable(): bool
    {
        return (bool) config('sales_assistant.enabled') && $this->retell->isConfigured();
    }

    public function requiresAccessCode(): bool
    {
        return $this->accessCode() !== '';
    }

    public function acceptsAccessCode(?string $code): bool
    {
        return ! $this->requiresAccessCode() || hash_equals($this->accessCode(), trim((string) $code));
    }

    /**
     * @return array{sessionToken: string, expiresAt: CarbonImmutable, call: array{call_id: string, access_token: string, transport: string|null, url: string|null, ice_servers: array<int, mixed>|null, expires_at: int|null}}
     *
     * @throws SalesAssistantException
     */
    public function start(): array
    {
        if (! $this->retell->isConfigured()) {
            throw SalesAssistantException::notConfigured();
        }

        $this->reserveDailySession();

        try {
            $call = $this->retell->createWebCall(['source' => 'adriaholiday-sales-assistant-demo']);
        } catch (SalesAssistantException $exception) {
            // A conversation that never started does not count against the day.
            $this->cache->decrement($this->dailyCounterKey());

            throw $exception;
        }

        $expiresAt = CarbonImmutable::now()->addSeconds((int) config('sales_assistant.session_ttl_seconds'));

        return [
            'sessionToken' => $this->sessions->open($call['call_id'], $expiresAt),
            'expiresAt' => $expiresAt,
            'call' => $call,
        ];
    }

    public function isLive(string $token): bool
    {
        return $this->sessions->callId($token) !== null;
    }

    public function end(string $token): void
    {
        $this->sessions->close($token);
    }

    /**
     * Whether a function call comes from a call of the configured agent.
     */
    public function isOwnAgent(?string $agentId): bool
    {
        return $agentId !== null && hash_equals($this->retell->agentId(), $agentId);
    }

    /**
     * Runs one function call of a Retell call, and remembers the trips it
     * talks about for the demo page.
     *
     * @param  array<string, mixed>  $arguments  validated against the tool's rules
     *
     * @throws SalesAssistantToolException
     */
    public function executeTool(string $callId, SalesAssistantTool $tool, array $arguments): SalesAssistantToolResult
    {
        if ($this->calls->recordToolCall($callId) > (int) config('sales_assistant.max_tool_calls_per_session')) {
            throw SalesAssistantToolException::budgetExhausted();
        }

        $result = $this->tools->execute($tool, $arguments);

        if ($result->trips->isNotEmpty() || $result->replacesRecommendations) {
            $this->calls->rememberTrips(
                $callId,
                $result->trips->pluck('id')->all(),
                $result->replacesRecommendations,
                (int) config('sales_assistant.max_search_results'),
            );
        }

        return $result;
    }

    /**
     * The tour ids recommended so far in the session's call.
     *
     * @return array<int, int>
     */
    public function recommendedTripIds(string $token): array
    {
        $callId = $this->sessions->callId($token);

        return $callId !== null ? $this->calls->trips($callId) : [];
    }

    /**
     * @throws SalesAssistantException when today's conversations are used up
     */
    private function reserveDailySession(): void
    {
        $key = $this->dailyCounterKey();
        $this->cache->add($key, 0, now()->endOfDay());

        if ((int) $this->cache->increment($key) > (int) config('sales_assistant.daily_session_limit')) {
            $this->cache->decrement($key);

            throw SalesAssistantException::dailyLimitReached();
        }
    }

    private function dailyCounterKey(): string
    {
        return 'sales-assistant:sessions:'.now()->toDateString();
    }

    private function accessCode(): string
    {
        return trim((string) config('sales_assistant.access_code'));
    }
}
