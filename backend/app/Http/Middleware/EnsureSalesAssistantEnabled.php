<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Hides every AI sales assistant endpoint while the feature flag is off.
 * With "page" (`sales-assistant.enabled:page`) the endpoints of the demo
 * page also stay hidden until the page itself is switched on.
 */
class EnsureSalesAssistantEnabled
{
    public function handle(Request $request, Closure $next, ?string $scope = null): Response
    {
        if (! config('sales_assistant.enabled') || ($scope === 'page' && ! config('sales_assistant.demo_page_enabled'))) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        return $next($request);
    }
}
