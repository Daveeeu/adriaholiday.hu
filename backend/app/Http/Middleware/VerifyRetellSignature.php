<?php

namespace App\Http\Middleware;

use App\Support\SalesAssistant\RetellSignature;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Admits only requests Retell signed with the configured API key (the
 * X-Retell-Signature header over the raw body), recently enough that a
 * captured request cannot be replayed later.
 */
class VerifyRetellSignature
{
    public const HEADER = 'X-Retell-Signature';

    public function handle(Request $request, Closure $next): Response
    {
        $verified = RetellSignature::verify(
            $request->getContent(),
            trim((string) config('sales_assistant.retell.api_key')),
            $request->header(self::HEADER),
            now()->getTimestampMs(),
            (int) config('sales_assistant.retell.signature_tolerance_seconds') * 1000,
        );

        if (! $verified) {
            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        return $next($request);
    }
}
