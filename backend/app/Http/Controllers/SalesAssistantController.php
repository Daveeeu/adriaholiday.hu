<?php

namespace App\Http\Controllers;

use App\Http\Middleware\RequireSalesAssistantSession;
use App\Http\Requests\ExecuteSalesAssistantToolRequest;
use App\Http\Requests\StartSalesAssistantSessionRequest;
use App\Http\Resources\SalesAssistantSessionResource;
use App\Http\Resources\SalesAssistantToolResultResource;
use App\Services\SalesAssistant\SalesAssistantSessionService;
use App\Services\SalesAssistant\SalesAssistantToolRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * The AI travel sales assistant demo: conversation lifecycle and the
 * read-only catalog tools its model calls.
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
        $this->sessions->end((string) $request->attributes->get(RequireSalesAssistantSession::ATTRIBUTE));

        return response()->noContent();
    }

    public function executeTool(ExecuteSalesAssistantToolRequest $request, SalesAssistantToolRegistry $tools): SalesAssistantToolResultResource
    {
        $this->sessions->authorizeToolCall($request->sessionToken());
        $tool = $request->tool();

        return new SalesAssistantToolResultResource($tools->execute($tool, $request->toolArguments()), $tool->name());
    }
}
