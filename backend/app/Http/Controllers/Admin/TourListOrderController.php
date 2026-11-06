<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Tour\UpdateTourListOrderRequest;
use App\Http\Resources\TourListItemResource;
use App\Models\Tour;
use App\Services\Tour\TourListOrder;
use App\Support\Tour\TourList;
use Illuminate\Http\JsonResponse;

/**
 * The tour order of each homepage tile's category page, of each country and
 * of the homepage's featured offers (see TourListOrder).
 */
class TourListOrderController extends Controller
{
    public function __construct(private readonly TourListOrder $listOrder)
    {
        $this->middleware('permission:tours.reorder');
    }

    public function index(): JsonResponse
    {
        $this->authorize('reorder', Tour::class);

        return response()->json([
            'data' => [
                'tiles' => $this->listOrder->tileLists(),
                'countries' => $this->listOrder->countryLists(),
                'featured' => [$this->listOrder->featuredList()],
            ],
        ]);
    }

    public function show(string $type, string $key): JsonResponse
    {
        $this->authorize('reorder', Tour::class);

        return $this->listResponse(TourList::make($type, $key));
    }

    public function update(UpdateTourListOrderRequest $request): JsonResponse
    {
        $this->authorize('reorder', Tour::class);

        $list = $request->tourList();
        $this->listOrder->save($list, $request->tourIds());

        return $this->listResponse($list);
    }

    public function destroy(string $type, string $key): JsonResponse
    {
        $this->authorize('reorder', Tour::class);

        $list = TourList::make($type, $key);
        $this->listOrder->reset($list);

        return $this->listResponse($list);
    }

    private function listResponse(TourList $list): JsonResponse
    {
        $placedTourIds = $this->listOrder->placedTourIds($list);

        return response()->json([
            'data' => $this->listOrder->tours($list)
                ->map(fn (Tour $tour): array => (new TourListItemResource($tour, $placedTourIds))->resolve())
                ->values(),
        ]);
    }
}
