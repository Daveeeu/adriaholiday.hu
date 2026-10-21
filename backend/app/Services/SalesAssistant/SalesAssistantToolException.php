<?php

namespace App\Services\SalesAssistant;

use Illuminate\Contracts\Debug\ShouldntReport;
use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * A function call the catalog cannot answer (unknown trip, departure that is
 * not bookable...). Retell hands the response body to the model as the
 * function's result, so the message is written for the model: it explains
 * what went wrong and what to do next, and `details` may list valid choices.
 *
 * It is answered with HTTP 200: Retell treats any other status as a failed
 * request, and the model would never read the guidance. Being expected, it
 * is never written to the error log (unexpected failures are, see the tool
 * registry).
 */
class SalesAssistantToolException extends RuntimeException implements ShouldntReport
{
    /**
     * @param  array<string, mixed>  $details
     */
    public function __construct(
        public readonly string $errorCode,
        string $message,
        public readonly array $details = [],
    ) {
        parent::__construct($message);
    }

    public static function tripNotFound(string $slug): self
    {
        return new self(
            'trip_not_found',
            "No bookable trip has the slug \"{$slug}\". Use a slug returned by search_trips; never guess one.",
        );
    }

    public static function departureNotFound(): self
    {
        return new self(
            'departure_not_found',
            'This trip has no upcoming departure with that departure_id. Call get_trip_departures for valid ids.',
        );
    }

    public static function failed(): self
    {
        return new self(
            'tool_failed',
            'The catalog could not be queried right now. Tell the customer the information cannot be verified at the moment and offer to have a colleague call back.',
        );
    }

    public static function budgetExhausted(): self
    {
        return new self(
            'tool_budget_exhausted',
            'This conversation reached its limit of catalog lookups. Tell the customer you cannot look up more now and suggest browsing the website or calling the office.',
        );
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'error' => array_filter([
                'code' => $this->errorCode,
                'message' => $this->getMessage(),
                'details' => $this->details,
            ], fn (mixed $value): bool => $value !== []),
        ]);
    }
}
