<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Tour\PreviewTourRouteMapRequest;
use App\Http\Requests\Admin\Tour\SearchRouteStopPlacesRequest;
use App\Models\Tour;
use App\Services\Geo\PlaceSearch;
use App\Services\Geo\PlaceSearchUnavailable;
use App\Services\Tour\RouteMap\TourRouteMapService;
use App\Support\Tour\RouteStopSuggestions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

/**
 * The tour editor's route map tools: finding a stop's place, suggesting stops
 * from the program, and previewing the map before saving.
 */
class TourRouteMapController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:tours.create|tours.update');
    }

    public function places(SearchRouteStopPlacesRequest $request, PlaceSearch $places): JsonResponse
    {
        try {
            return response()->json(['data' => $places->search($request->validated('q'))]);
        } catch (PlaceSearchUnavailable) {
            return response()->json(['message' => 'A helykereső most nem érhető el, kérjük, próbáld újra később.'], 503);
        }
    }

    public function suggestions(Tour $tour): JsonResponse
    {
        return response()->json(['data' => RouteStopSuggestions::for($tour)]);
    }

    public function preview(PreviewTourRouteMapRequest $request, TourRouteMapService $routeMaps): Response
    {
        return response((string) $routeMaps->preview($request->validated('route_stops')), 200, [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'no-store',
        ]);
    }
}
