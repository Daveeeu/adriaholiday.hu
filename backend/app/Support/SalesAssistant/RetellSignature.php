<?php

namespace App\Support\SalesAssistant;

/**
 * Retell's request signature (the X-Retell-Signature header), as its SDKs
 * sign and verify it: "v=<unix ms>,d=<hex HMAC-SHA256 of body.timestamp>",
 * keyed with the Retell API key, valid within a few minutes of signing.
 */
final class RetellSignature
{
    public static function sign(string $body, string $apiKey, int $timestampMs): string
    {
        return sprintf('v=%d,d=%s', $timestampMs, hash_hmac('sha256', $body.$timestampMs, $apiKey));
    }

    /**
     * @param  string  $body  the raw request body, byte for byte
     */
    public static function verify(string $body, string $apiKey, ?string $signature, int $nowMs, int $toleranceMs): bool
    {
        if ($apiKey === '' || $signature === null || preg_match('/^v=(\d{1,16}),d=([0-9a-f]{64})$/', trim($signature), $match) !== 1) {
            return false;
        }

        $timestampMs = (int) $match[1];

        if (abs($nowMs - $timestampMs) > $toleranceMs) {
            return false;
        }

        return hash_equals(hash_hmac('sha256', $body.$timestampMs, $apiKey), $match[2]);
    }
}
