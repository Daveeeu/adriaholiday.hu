<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Hides every AI sales assistant endpoint while the feature flag is off.
 */
class EnsureSalesAssistantEnabled
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('sales_assistant.enabled')) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        return $next($request);
    }
}
