<?php

namespace App\Http\Middleware;

use App\Services\SalesAssistant\SalesAssistantException;
use App\Services\SalesAssistant\SalesAssistantSessionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Admits only requests carrying the token of a live assistant session (in
 * the X-Assistant-Session header, so it never lands in access logs).
 */
class RequireSalesAssistantSession
{
    public const HEADER = 'X-Assistant-Session';

    public const ATTRIBUTE = 'salesAssistantSessionToken';

    public function __construct(private readonly SalesAssistantSessionService $sessions) {}

    public function handle(Request $request, Closure $next): Response
    {
        $token = trim((string) $request->header(self::HEADER));

        if ($token === '' || strlen($token) > 128 || ! $this->sessions->isLive($token)) {
            throw SalesAssistantException::sessionInvalid();
        }

        $request->attributes->set(self::ATTRIBUTE, $token);

        return $next($request);
    }
}
