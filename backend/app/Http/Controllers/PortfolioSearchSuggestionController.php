<?php

namespace App\Http\Controllers;

use App\Services\Tour\TourSearchSuggestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortfolioSearchSuggestionController extends Controller
{
    public function __invoke(Request $request, TourSearchSuggestionService $suggestions): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        return response()->json([
            'data' => $suggestions->suggest((string) ($validated['q'] ?? '')),
        ]);
    }
}
