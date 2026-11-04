<?php

namespace App\Services\Geo;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Finds places by name with OpenStreetMap's Nominatim, for the tours' route
 * map stops: Hungarian names where OpenStreetMap has them ("Belgrád").
 * Answers are cached, keeping well within Nominatim's usage policy.
 */
class PlaceSearch
{
    private const LIMIT = 6;

    private const CACHE_DAYS = 30;

    /**
     * @return array<int, array{name: string, description: string, latitude: float, longitude: float}>
     */
    public function search(string $query): array
    {
        $query = trim($query);

        if (mb_strlen($query) < 2) {
            return [];
        }

        return Cache::remember('place-search:'.sha1(mb_strtolower($query)), now()->addDays(self::CACHE_DAYS), fn (): array => $this->fetch($query));
    }

    /**
     * @return array<int, array{name: string, description: string, latitude: float, longitude: float}>
     */
    private function fetch(string $query): array
    {
        try {
            $response = Http::baseUrl((string) config('services.nominatim.base_url'))
                ->withUserAgent((string) config('services.nominatim.user_agent'))
                ->timeout((int) config('services.nominatim.timeout'))
                ->acceptJson()
                ->get('/search', [
                    'q' => $query,
                    'format' => 'jsonv2',
                    'addressdetails' => 1,
                    'accept-language' => 'hu',
                    'limit' => self::LIMIT,
                ])
                ->throw();
        } catch (Throwable $exception) {
            Log::warning('Place search failed.', ['query' => $query, 'message' => $exception->getMessage()]);

            throw new PlaceSearchUnavailable(previous: $exception);
        }

        return collect($response->json() ?? [])
            ->filter(fn (mixed $place): bool => is_array($place) && isset($place['lat'], $place['lon']))
            ->map(fn (array $place): array => [
                'name' => (string) ($place['name'] ?? '') ?: strtok((string) $place['display_name'], ','),
                'description' => (string) ($place['display_name'] ?? ''),
                'latitude' => round((float) $place['lat'], 5),
                'longitude' => round((float) $place['lon'], 5),
            ])
            ->values()
            ->all();
    }
}
