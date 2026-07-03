<?php

namespace App\Http\Controllers;

use App\Support\ProductionHealth;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function __invoke(ProductionHealth $health): JsonResponse
    {
        $snapshot = $health->snapshot();

        return response()->json(
            $snapshot,
            $snapshot['status'] === 'ok' ? 200 : 503,
        );
    }
}
