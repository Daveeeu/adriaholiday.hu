<?php

namespace App\Http\Controllers;

use App\Http\Requests\Public\PortfolioApartmentSearchRequest;
use App\Http\Requests\Public\StoreApartmentBookingRequest;
use App\Http\Resources\PortfolioApartmentCardResource;
use App\Http\Resources\PortfolioApartmentDetailResource;
use App\Http\Resources\PortfolioApartmentLocationResource;
use App\Models\Apartment;
use App\Models\Location;
use App\Services\Apartment\ApartmentSearch;
use App\Services\Booking\ApartmentBookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The public apartment pages: a location's page with its searchable
 * apartment list (/apartmanok/{area}/{location}) and an apartment's page
 * (/apartman/{slug}) with its booking form.
 */
class PortfolioApartmentController extends Controller
{
    private const HIGHLIGHTED_APARTMENTS = 3;

    public function __construct(private readonly ApartmentSearch $search) {}

    /**
     * The home page's apartment section: the locations with an apartment page
     * and a few apartments to show off.
     */
    public function highlights(Request $request): JsonResponse
    {
        $locations = Location::query()
            ->withApartmentPage()
            ->with('region')
            ->withCount(['apartments' => fn ($apartments) => $apartments->publiclyVisible()])
            ->orderByDesc('apartments_count')
            ->get();

        return response()->json([
            'locations' => $locations->map(fn (Location $location): array => [
                'name' => $location->name,
                'areaName' => $location->area_name,
                'regionName' => $location->region?->name,
                'link' => $location->apartmentPagePath(),
                'apartmentCount' => (int) $location->apartments_count,
            ])->all(),
            'apartments' => PortfolioApartmentCardResource::collection($this->search->highlighted(self::HIGHLIGHTED_APARTMENTS))->resolve($request),
        ]);
    }

    public function location(string $area, string $location): JsonResponse
    {
        return response()->json((new PortfolioApartmentLocationResource($this->publicLocation($area, $location)))->resolve(request()));
    }

    public function apartments(PortfolioApartmentSearchRequest $request, string $area, string $location): JsonResponse
    {
        $paginator = $this->search->search($this->publicLocation($area, $location), $request->validated());

        return response()->json([
            'items' => PortfolioApartmentCardResource::collection($paginator->getCollection())->resolve($request),
            'totalCount' => $paginator->total(),
            'page' => $paginator->currentPage(),
            'perPage' => $paginator->perPage(),
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $apartment = $this->publicApartment($slug)->load(['location.region', 'galleryItems.media']);

        return response()->json((new PortfolioApartmentDetailResource($apartment))->resolve(request()));
    }

    public function book(StoreApartmentBookingRequest $request, ApartmentBookingService $bookings, string $slug): JsonResponse
    {
        $booking = $bookings->submit($this->publicApartment($slug)->load('location'), $request->validated());

        return response()->json(['id' => $booking->id, 'status' => $booking->status], 201);
    }

    private function publicApartment(string $slug): Apartment
    {
        $apartment = Apartment::query()->publiclyVisible()->where('slug', $slug)->first();

        abort_if($apartment === null, 404, 'Az apartman nem található.');

        return $apartment;
    }

    private function publicLocation(string $area, string $slug): Location
    {
        $location = Location::query()
            ->withApartmentPage()
            ->where('area_slug', $area)
            ->where('slug', $slug)
            ->with('region')
            ->first();

        abort_if($location === null, 404, 'A helyszín nem található.');

        return $location;
    }
}
