<?php

namespace App\Services\Analytics;

use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Sends server-side events to GA4 (Measurement Protocol). Used for what the
 * browser cannot report reliably, such as a payment confirmed by Barion's
 * callback; does nothing until the measurement id and API secret are set.
 */
class GoogleAnalyticsMeasurementProtocol
{
    private const ENDPOINT = 'https://www.google-analytics.com/mp/collect';

    public function __construct(
        private readonly HttpFactory $http,
    ) {}

    public function isConfigured(): bool
    {
        return trim((string) config('analytics.google.measurement_id')) !== ''
            && trim((string) config('analytics.google.api_secret')) !== '';
    }

    /**
     * @param  array<string, mixed>  $params
     */
    public function send(string $clientId, string $eventName, array $params, ?string $sessionId = null): void
    {
        if (! $this->isConfigured()) {
            return;
        }

        if ($sessionId !== null) {
            // Joins the event to the visitor's session, and so to its traffic source.
            $params['session_id'] = $sessionId;
        }

        try {
            $this->http
                ->asJson()
                ->timeout((int) config('analytics.google.timeout_seconds'))
                ->withQueryParameters([
                    'measurement_id' => config('analytics.google.measurement_id'),
                    'api_secret' => config('analytics.google.api_secret'),
                ])
                ->post(self::ENDPOINT, [
                    'client_id' => $clientId,
                    'events' => [['name' => $eventName, 'params' => $params]],
                ])
                ->throw();
        } catch (Throwable $throwable) {
            Log::warning('GA4 Measurement Protocol request failed.', [
                'event_name' => $eventName,
                'message' => $throwable->getMessage(),
            ]);
        }
    }
}
