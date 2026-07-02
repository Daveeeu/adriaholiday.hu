<?php

namespace App\Http\Controllers;

use App\Http\Requests\Analytics\StoreAnalyticsEventRequest;
use App\Services\Analytics\AnalyticsIngestionService;
use Illuminate\Http\JsonResponse;

class AnalyticsEventController extends Controller
{
    public function __invoke(
        StoreAnalyticsEventRequest $request,
        AnalyticsIngestionService $ingestionService,
    ): JsonResponse {
        $result = $ingestionService->capture($request);

        return response()->json($result, 202);
    }
}
