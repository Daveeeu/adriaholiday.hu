<?php

namespace App\Services\SalesAssistant;

use App\Support\SalesAssistant\SalesAssistantInstructions;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Cache\Repository as Cache;

/**
 * Starts and ends assistant conversations. A conversation gets an OpenAI
 * client secret (for the browser's voice connection) and an assistant
 * session (for the catalog tools), both short-lived. The number of
 * conversations a day is capped, since each one costs OpenAI usage.
 */
class SalesAssistantSessionService
{
    public function __construct(
        private readonly OpenAiRealtimeClient $openAi,
        private readonly SalesAssistantSessionStore $sessions,
        private readonly SalesAssistantToolRegistry $tools,
        private readonly Cache $cache,
    ) {}

    public function isAvailable(): bool
    {
        return (bool) config('sales_assistant.enabled') && $this->openAi->isConfigured();
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
     * @return array{sessionToken: string, expiresAt: CarbonImmutable, clientSecret: string, clientSecretExpiresAt: CarbonImmutable, model: string}
     *
     * @throws SalesAssistantException
     */
    public function start(): array
    {
        if (! $this->openAi->isConfigured()) {
            throw SalesAssistantException::notConfigured();
        }

        $this->reserveDailySession();

        try {
            $clientSecret = $this->openAi->createClientSecret($this->realtimeSession());
        } catch (SalesAssistantException $exception) {
            // A conversation that never started does not count against the day.
            $this->cache->decrement($this->dailyCounterKey());

            throw $exception;
        }

        $expiresAt = CarbonImmutable::now()->addSeconds((int) config('sales_assistant.session_ttl_seconds'));

        return [
            'sessionToken' => $this->sessions->open($expiresAt),
            'expiresAt' => $expiresAt,
            'clientSecret' => $clientSecret['value'],
            'clientSecretExpiresAt' => $clientSecret['expiresAt'],
            'model' => (string) config('sales_assistant.openai.model'),
        ];
    }

    /**
     * Counts a tool call of a live session.
     *
     * @throws SalesAssistantException when the session is over or out of tool calls
     */
    public function authorizeToolCall(string $token): void
    {
        if ($this->sessions->expiresAt($token) === null) {
            throw SalesAssistantException::sessionInvalid();
        }

        if ($this->sessions->recordToolCall($token) > (int) config('sales_assistant.max_tool_calls_per_session')) {
            throw SalesAssistantException::toolBudgetExhausted();
        }
    }

    public function isLive(string $token): bool
    {
        return $this->sessions->expiresAt($token) !== null;
    }

    public function end(string $token): void
    {
        $this->sessions->close($token);
    }

    /**
     * The Realtime session the browser connects to: Hungarian voice in and
     * out, the catalog tools, and the sales instructions.
     *
     * @return array<string, mixed>
     */
    private function realtimeSession(): array
    {
        return [
            'type' => 'realtime',
            'model' => (string) config('sales_assistant.openai.model'),
            'instructions' => SalesAssistantInstructions::build(now(), (int) config('sales_assistant.max_search_results')),
            'output_modalities' => ['audio'],
            'audio' => [
                'input' => [
                    'transcription' => [
                        'model' => (string) config('sales_assistant.openai.transcription_model'),
                        'language' => 'hu',
                    ],
                    'noise_reduction' => ['type' => 'near_field'],
                    'turn_detection' => [
                        'type' => 'semantic_vad',
                        'eagerness' => 'auto',
                        'create_response' => true,
                        'interrupt_response' => true,
                    ],
                ],
                'output' => [
                    'voice' => (string) config('sales_assistant.openai.voice'),
                ],
            ],
            'tools' => $this->tools->definitions(),
            'tool_choice' => 'auto',
        ];
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
