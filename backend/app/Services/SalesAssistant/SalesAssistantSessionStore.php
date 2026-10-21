<?php

namespace App\Services\SalesAssistant;

use Carbon\CarbonImmutable;
use Illuminate\Contracts\Cache\Repository as Cache;
use Illuminate\Support\Str;

/**
 * Assistant sessions, kept in the cache only: a session is the right of one
 * browser to follow the Retell web call it started (its recommended trips)
 * until it expires or ends. Nothing about the conversation itself (audio,
 * transcript) is stored.
 *
 * The browser holds the session token; the cache key is its hash, so a
 * cache dump never reveals usable tokens.
 */
class SalesAssistantSessionStore
{
    private const PREFIX = 'sales-assistant:session:';

    public function __construct(private readonly Cache $cache) {}

    /**
     * Opens a session for a web call and returns its token.
     */
    public function open(string $callId, CarbonImmutable $expiresAt): string
    {
        $token = Str::random(64);

        $this->cache->put($this->key($token), ['call_id' => $callId, 'expires_at' => $expiresAt->getTimestamp()], $expiresAt);

        return $token;
    }

    /**
     * The web call of a live session, or null for an unknown, ended or expired token.
     */
    public function callId(string $token): ?string
    {
        $session = $this->cache->get($this->key($token));

        if (! is_array($session) || ! isset($session['call_id'], $session['expires_at'])) {
            return null;
        }

        return CarbonImmutable::createFromTimestamp((int) $session['expires_at'])->isFuture() ? (string) $session['call_id'] : null;
    }

    public function close(string $token): void
    {
        $this->cache->forget($this->key($token));
    }

    private function key(string $token): string
    {
        return self::PREFIX.hash('sha256', $token);
    }
}
