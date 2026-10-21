<?php

namespace App\Services\SalesAssistant;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * An expected failure of the assistant's session lifecycle, rendered as
 * `{"message": ..., "error": {"code": ...}}` with its HTTP status. The
 * message is Hungarian: the demo page shows it to the visitor as is.
 */
class SalesAssistantException extends RuntimeException
{
    public function __construct(
        public readonly string $errorCode,
        string $message,
        public readonly int $status,
    ) {
        parent::__construct($message);
    }

    public static function notConfigured(): self
    {
        return new self('not_configured', 'Az AI tanácsadó jelenleg nem érhető el.', 503);
    }

    public static function dailyLimitReached(): self
    {
        return new self('daily_limit_reached', 'A demó mai kerete elfogyott. Kérjük, próbáld újra holnap.', 503);
    }

    public static function upstreamFailed(): self
    {
        return new self('upstream_failed', 'Nem sikerült kapcsolatot létesíteni az AI szolgáltatással. Kérjük, próbáld újra.', 502);
    }

    public static function sessionInvalid(): self
    {
        return new self('session_invalid', 'A beszélgetés lejárt vagy már befejeződött. Indíts újat.', 401);
    }

    public static function toolBudgetExhausted(): self
    {
        return new self('tool_budget_exhausted', 'Ebben a beszélgetésben elértük a lekérdezések számának korlátját. Indíts új beszélgetést.', 429);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'error' => ['code' => $this->errorCode],
        ], $this->status);
    }
}
