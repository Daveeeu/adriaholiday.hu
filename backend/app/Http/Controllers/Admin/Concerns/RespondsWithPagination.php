<?php

namespace App\Http\Controllers\Admin\Concerns;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;

trait RespondsWithPagination
{
    protected function paginated(string $resourceClass, LengthAwarePaginator $paginator): JsonResponse
    {
        $items = $resourceClass::collection($paginator->items())->resolve();

        return response()->json([
            'items' => $items,
            'totalCount' => $paginator->total(),
            'page' => $paginator->currentPage(),
            'perPage' => $paginator->perPage(),
        ]);
    }
}
