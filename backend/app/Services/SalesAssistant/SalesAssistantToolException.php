<?php

namespace App\Services\SalesAssistant;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * A tool call the catalog cannot answer (unknown trip, departure that is not
 * bookable...). The browser hands the body to the model as the function's
 * output, so the message is written for the model: it explains what went
 * wrong and what to do next, and `details` may list valid choices.
 */
class SalesAssistantToolException extends RuntimeException
{
    /**
     * @param  array<string, mixed>  $details
     */
    public function __construct(
        public readonly string $errorCode,
        string $message,
        public readonly int $status = 422,
        public readonly array $details = [],
    ) {
        parent::__construct($message);
    }

    public static function tripNotFound(string $slug): self
    {
        return new self(
            'trip_not_found',
            "No bookable trip has the slug \"{$slug}\". Use a slug returned by search_trips; never guess one.",
            404,
        );
    }

    public static function departureNotFound(): self
    {
        return new self(
            'departure_not_found',
            'This trip has no upcoming departure with that departure_id. Call get_trip_departures for valid ids.',
            404,
        );
    }

    public static function failed(): self
    {
        return new self(
            'tool_failed',
            'The catalog could not be queried right now. Tell the customer the information cannot be verified at the moment and offer to have a colleague call back.',
            500,
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
        ], $this->status);
    }
}
