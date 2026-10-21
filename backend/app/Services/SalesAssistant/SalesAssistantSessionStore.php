<?php

namespace App\Services\SalesAssistant;

use Carbon\CarbonImmutable;
use Illuminate\Contracts\Cache\Repository as Cache;
use Illuminate\Support\Str;

/**
 * Assistant sessions, kept in the cache only: a session is the right of one
 * browser conversation to call the catalog tools until it expires or ends.
 * Nothing about the conversation itself (audio, transcript) is stored.
 *
 * The browser holds the session token; the cache key is its hash, so a
 * cache dump never reveals usable tokens.
 */
class SalesAssistantSessionStore
{
    private const PREFIX = 'sales-assistant:session:';

    public function __construct(private readonly Cache $cache) {}

    /**
     * Opens a session and returns its token.
     */
    public function open(CarbonImmutable $expiresAt): string
    {
        $token = Str::random(64);

        $this->cache->put($this->key($token), ['expires_at' => $expiresAt->getTimestamp()], $expiresAt);
        $this->cache->put($this->toolCallsKey($token), 0, $expiresAt);

        return $token;
    }

    /**
     * When the session ends, or null for an unknown, ended or expired token.
     */
    public function expiresAt(string $token): ?CarbonImmutable
    {
        $session = $this->cache->get($this->key($token));

        if (! is_array($session) || ! isset($session['expires_at'])) {
            return null;
        }

        $expiresAt = CarbonImmutable::createFromTimestamp((int) $session['expires_at']);

        return $expiresAt->isFuture() ? $expiresAt : null;
    }

    /**
     * Counts a tool call and returns how many the session has made.
     */
    public function recordToolCall(string $token): int
    {
        return (int) $this->cache->increment($this->toolCallsKey($token));
    }

    public function close(string $token): void
    {
        $this->cache->forget($this->key($token));
        $this->cache->forget($this->toolCallsKey($token));
    }

    private function key(string $token): string
    {
        return self::PREFIX.hash('sha256', $token);
    }

    private function toolCallsKey(string $token): string
    {
        return $this->key($token).':tool-calls';
    }
}
