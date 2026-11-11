<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\ActivityLog\McpActivityLogger;
use Closure;
use Illuminate\Http\Request;
use Laravel\Passport\Guards\TokenGuard;
use Symfony\Component\HttpFoundation\Response;

/**
 * Lets an AI assistant's request reach the MCP server only for an active
 * staff member who may connect assistants (mcp.access), and records every
 * tool it calls. Each tool also checks the permission of the data it reads.
 */
class AuthorizeMcpRequest
{
    public const PERMISSION = 'mcp.access';

    public function __construct(private readonly McpActivityLogger $activityLogger) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof User || ! $user->is_active || ! $user->checkPermissionTo(self::PERMISSION)) {
            return response()->json([
                'message' => 'Ehhez a fiókhoz nincs AI asszisztens hozzáférés (mcp.access), vagy a fiók le van tiltva.',
            ], 403);
        }

        if ($request->input('method') === 'tools/call') {
            $arguments = $request->input('params.arguments');

            $this->activityLogger->toolCalled(
                $user,
                (string) $request->input('params.name'),
                is_array($arguments) ? $arguments : [],
                $this->clientName(),
                $request,
            );
        }

        return $next($request);
    }

    private function clientName(): ?string
    {
        $guard = auth()->guard('api');

        return $guard instanceof TokenGuard ? $guard->client()?->name : null;
    }
}
