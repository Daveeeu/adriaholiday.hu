<?php

namespace App\Services\Tour\RouteMap;

/**
 * The country outlines of resources/geo/countries.json (Natural Earth, see the
 * README there), and which country a place lies in.
 */
class CountryShapes
{
    /** A coastal place may fall just outside a simplified outline; this close (in degrees) still counts. */
    private const COAST_TOLERANCE = 0.5;

    /**
     * @var array<int, array{code: string, name: string, polygons: array<int, array{points: array<int, array{0: float, 1: float}>, bbox: array{0: float, 1: float, 2: float, 3: float}}>}>|null
     */
    private ?array $countries = null;

    /**
     * @return array<int, array{code: string, name: string, polygons: array<int, array{points: array<int, array{0: float, 1: float}>, bbox: array{0: float, 1: float, 2: float, 3: float}}>}>
     */
    public function all(): array
    {
        return $this->countries ??= array_map(fn (array $country): array => [
            'code' => $country['code'],
            'name' => $country['name'],
            'polygons' => array_map(fn (array $points): array => [
                'points' => $points,
                'bbox' => self::bbox($points),
            ], $country['polygons']),
        ], array_values(array_filter(
            json_decode((string) file_get_contents(resource_path('geo/countries.json')), true, flags: JSON_THROW_ON_ERROR),
            // Tiny islands simplify away entirely.
            fn (array $country): bool => $country['polygons'] !== [],
        )));
    }

    /**
     * The country the place lies in, or the nearest one along the coast.
     *
     * @return array{code: string, name: string, polygons: array<int, array{points: array<int, array{0: float, 1: float}>, bbox: array{0: float, 1: float, 2: float, 3: float}}>}|null
     */
    public function at(float $longitude, float $latitude): ?array
    {
        $nearest = null;
        $nearestDistance = self::COAST_TOLERANCE;

        foreach ($this->all() as $country) {
            foreach ($country['polygons'] as $polygon) {
                [$minLng, $minLat, $maxLng, $maxLat] = $polygon['bbox'];

                if ($longitude < $minLng - self::COAST_TOLERANCE || $longitude > $maxLng + self::COAST_TOLERANCE
                    || $latitude < $minLat - self::COAST_TOLERANCE || $latitude > $maxLat + self::COAST_TOLERANCE) {
                    continue;
                }

                if (self::contains($polygon['points'], $longitude, $latitude)) {
                    return $country;
                }

                foreach ($polygon['points'] as [$lng, $lat]) {
                    $distance = hypot($lng - $longitude, $lat - $latitude);

                    if ($distance < $nearestDistance) {
                        $nearest = $country;
                        $nearestDistance = $distance;
                    }
                }
            }
        }

        return $nearest;
    }

    /**
     * @param  array<int, array{0: float, 1: float}>  $points
     * @return array{0: float, 1: float, 2: float, 3: float} min longitude, min latitude, max longitude, max latitude
     */
    public static function bbox(array $points): array
    {
        $longitudes = array_column($points, 0);
        $latitudes = array_column($points, 1);

        return [min($longitudes), min($latitudes), max($longitudes), max($latitudes)];
    }

    /**
     * Ray casting: whether the point lies inside the ring.
     *
     * @param  array<int, array{0: float, 1: float}>  $points
     */
    private static function contains(array $points, float $x, float $y): bool
    {
        $inside = false;
        $count = count($points);

        for ($i = 0, $j = $count - 1; $i < $count; $j = $i++) {
            [$xi, $yi] = $points[$i];
            [$xj, $yj] = $points[$j];

            if (($yi > $y) !== ($yj > $y) && $x < ($xj - $xi) * ($y - $yi) / ($yj - $yi) + $xi) {
                $inside = ! $inside;
            }
        }

        return $inside;
    }
}
