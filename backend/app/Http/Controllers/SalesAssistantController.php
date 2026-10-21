<?php

namespace App\Http\Controllers;

use App\Http\Middleware\RequireSalesAssistantSession;
use App\Http\Requests\RetellFunctionRequest;
use App\Http\Requests\StartSalesAssistantSessionRequest;
use App\Http\Resources\PortfolioFeaturedTourResource;
use App\Http\Resources\SalesAssistantSessionResource;
use App\Services\SalesAssistant\SalesAssistantSessionService;
use App\Services\SalesAssistant\TripCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * The AI travel sales assistant demo: the browser's conversation lifecycle,
 * and the read-only catalog functions the Retell agent calls.
 */
class SalesAssistantController extends Controller
{
    public function __construct(private readonly SalesAssistantSessionService $sessions) {}

    public function status(): JsonResponse
    {
        return response()->json([
            'data' => [
                'available' => $this->sessions->isAvailable(),
                'accessCodeRequired' => $this->sessions->requiresAccessCode(),
                'maxRecommendations' => (int) config('sales_assistant.max_search_results'),
            ],
        ]);
    }

    public function store(StartSalesAssistantSessionRequest $request): JsonResponse
    {
        return (new SalesAssistantSessionResource($this->sessions->start()))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(Request $request): Response
    {
        $this->sessions->end($this->sessionToken($request));

        return response()->noContent();
    }

    public function recommendations(Request $request, TripCatalog $catalog): JsonResponse
    {
        $trips = $catalog->cardsByIds($this->sessions->recommendedTripIds($this->sessionToken($request)));

        return response()->json([
            'data' => ['trips' => PortfolioFeaturedTourResource::collection($trips)->resolve($request)],
        ]);
    }

    /**
     * Answers with the tool's result as is: Retell hands it to the model.
     */
    public function executeFunction(RetellFunctionRequest $request): JsonResponse
    {
        $result = $this->sessions->executeTool($request->callId(), $request->tool(), $request->toolArguments());

        return response()->json($result->result);
    }

    private function sessionToken(Request $request): string
    {
        return (string) $request->attributes->get(RequireSalesAssistantSession::ATTRIBUTE);
    }
}
