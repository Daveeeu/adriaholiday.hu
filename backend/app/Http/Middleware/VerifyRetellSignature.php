<?php

namespace App\Http\Middleware;

use App\Support\SalesAssistant\RetellSignature;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
            // Enough to tell a misconfigured Retell function (wrong key, missing header) from noise; never the body or the key.
            Log::warning('Retell function call rejected: invalid signature.', [
                'tool' => $request->route('tool'),
                'signature_present' => $request->hasHeader(self::HEADER),
                'key_configured' => trim((string) config('sales_assistant.retell.api_key')) !== '',
                'ip' => $request->ip(),
            ]);

            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        return $next($request);
    }
}
