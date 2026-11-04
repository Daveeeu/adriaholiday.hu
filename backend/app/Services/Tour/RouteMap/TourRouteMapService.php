<?php

namespace App\Services\Tour\RouteMap;

use App\Models\Tour;
use App\Support\Tour\TourRouteStops;
use Illuminate\Support\Facades\Storage;

/**
 * Keeps each tour's route map image on the public disk, named after its stops
 * and the renderer version, so a map is drawn once and redrawn only when the
 * stops or the drawing change. Tours with the same stops share one image.
 */
class TourRouteMapService
{
    private const DIRECTORY = 'route-maps';

    public function __construct(private readonly RouteMapRenderer $renderer) {}

    /**
     * The map's public URL, drawing it first when needed; null for a tour
     * without stops.
     */
    public function url(Tour $tour): ?string
    {
        $path = $this->ensure($tour);

        return $path !== null ? Storage::disk('public')->url($path) : null;
    }

    /**
     * The map as a data URI, for the PDFs; null for a tour without stops.
     */
    public function dataUri(Tour $tour): ?string
    {
        $path = $this->ensure($tour);

        return $path !== null ? 'data:image/png;base64,'.base64_encode((string) Storage::disk('public')->get($path)) : null;
    }

    /**
     * The stored map's path on the public disk, drawn when missing.
     */
    public function ensure(Tour $tour): ?string
    {
        $stops = TourRouteStops::normalize($tour->route_stops);

        if ($stops === []) {
            return null;
        }

        $disk = Storage::disk('public');
        $path = self::DIRECTORY.'/'.sha1(json_encode([RouteMapRenderer::VERSION, $stops], JSON_THROW_ON_ERROR)).'.png';

        if (! $disk->exists($path)) {
            $disk->put($path, $this->renderer->render($stops));
        }

        return $path;
    }

    /**
     * A map of stops not saved yet, for the admin's preview.
     *
     * @param  array<int, array<string, mixed>>  $stops
     */
    public function preview(array $stops): ?string
    {
        $stops = TourRouteStops::normalize($stops);

        return $stops !== [] ? $this->renderer->render($stops) : null;
    }
}
