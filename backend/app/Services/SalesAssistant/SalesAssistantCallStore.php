<?php

namespace App\Services\SalesAssistant;

use Illuminate\Contracts\Cache\Repository as Cache;

/**
 * What the function calls of one Retell call leave behind, in the cache
 * only: how many calls it made, and the trips it is talking about (the
 * demo page shows them as cards). Kept for at most a call's maximum length.
 */
class SalesAssistantCallStore
{
    private const PREFIX = 'sales-assistant:call:';

    /**
     * Retell's longest possible call, in seconds.
     */
    private const TTL_SECONDS = 7200;

    public function __construct(private readonly Cache $cache) {}

    /**
     * Counts a function call and returns how many the call has made.
     */
    public function recordToolCall(string $callId): int
    {
        $key = $this->key($callId, 'tool-calls');
        $this->cache->add($key, 0, self::TTL_SECONDS);

        return (int) $this->cache->increment($key);
    }

    /**
     * The trips shown next to the conversation: a search replaces them, a
     * question about one trip brings it to the front. At most `max` are kept.
     *
     * @param  array<int, int>  $tourIds  in the order the tool returned them
     */
    public function rememberTrips(string $callId, array $tourIds, bool $replaces, int $max): void
    {
        $ordered = $replaces ? $tourIds : [...$tourIds, ...$this->trips($callId)];

        $this->cache->put($this->key($callId, 'trips'), array_slice(array_values(array_unique($ordered)), 0, $max), self::TTL_SECONDS);
    }

    /**
     * @return array<int, int> tour ids, most relevant first
     */
    public function trips(string $callId): array
    {
        $ids = $this->cache->get($this->key($callId, 'trips'));

        return is_array($ids) ? array_map('intval', $ids) : [];
    }

    private function key(string $callId, string $suffix): string
    {
        return self::PREFIX.hash('sha256', $callId).':'.$suffix;
    }
}
