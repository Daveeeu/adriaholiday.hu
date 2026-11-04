<?php

namespace App\Support\Tour;

/**
 * The stops of a tour's route map (tours.route_stops), in travel order: the
 * place's name as shown on the map, its coordinates and whether the tour
 * stays there overnight (drawn in red).
 */
final class TourRouteStops
{
    public const MAX_STOPS = 30;

    public const MAX_NAME_LENGTH = 60;

    /**
     * @param  array<int, array<string, mixed>>|null  $stops
     * @return array<int, array{name: string, latitude: float, longitude: float, accommodation: bool}>
     */
    public static function normalize(?array $stops): array
    {
        return array_values(array_filter(array_map(fn (array $stop): ?array => self::stop($stop), $stops ?? [])));
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public static function rules(string $field): array
    {
        return [
            $field => ['nullable', 'array', 'max:'.self::MAX_STOPS],
            "{$field}.*.name" => ['required', 'string', 'max:'.self::MAX_NAME_LENGTH],
            "{$field}.*.latitude" => ['required', 'numeric', 'between:-90,90'],
            "{$field}.*.longitude" => ['required', 'numeric', 'between:-180,180'],
            "{$field}.*.accommodation" => ['nullable', 'boolean'],
        ];
    }

    /**
     * @param  array<string, mixed>  $stop
     * @return array{name: string, latitude: float, longitude: float, accommodation: bool}|null
     */
    private static function stop(array $stop): ?array
    {
        $name = trim((string) ($stop['name'] ?? ''));

        if ($name === '' || ! is_numeric($stop['latitude'] ?? null) || ! is_numeric($stop['longitude'] ?? null)) {
            return null;
        }

        return [
            'name' => mb_substr($name, 0, self::MAX_NAME_LENGTH),
            'latitude' => round((float) $stop['latitude'], 5),
            'longitude' => round((float) $stop['longitude'], 5),
            'accommodation' => filter_var($stop['accommodation'] ?? false, FILTER_VALIDATE_BOOL),
        ];
    }
}
