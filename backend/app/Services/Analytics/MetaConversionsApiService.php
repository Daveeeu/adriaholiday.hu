<?php

namespace App\Services\Analytics;

use App\Models\AnalyticsEvent;
use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Support\Facades\Log;
use Throwable;

class MetaConversionsApiService
{
    public function __construct(
        private readonly HttpFactory $http,
    ) {
    }

    public function send(AnalyticsEvent $event, string $metaEventName): void
    {
        if (! (bool) config('analytics.meta.capi_enabled')) {
            return;
        }

        $pixelId = trim((string) config('analytics.meta.pixel_id'));
        $accessToken = (string) config('analytics.meta.access_token');

        if ($pixelId === '' || trim($accessToken) === '') {
            return;
        }

        $endpoint = sprintf(
            'https://graph.facebook.com/%s/%s/events',
            config('analytics.meta.api_version'),
            $pixelId,
        );

        $payload = [
            'data' => [[
                'event_name' => $metaEventName,
                'event_time' => $event->created_at?->timestamp ?? now()->timestamp,
                'event_id' => $event->event_id,
                'action_source' => 'website',
                'event_source_url' => $event->page_url,
                'user_data' => array_filter([
                    'client_user_agent' => $event->user_agent,
                    'fbp' => $event->fbp,
                    'fbc' => $event->fbc,
                ]),
                'custom_data' => array_filter([
                    'content_name' => $event->entity_slug,
                    'content_category' => $event->entity_type,
                    'content_ids' => $event->entity_id ? [$event->entity_id] : null,
                    'contents' => $event->entity_id ? [['id' => $event->entity_id, 'quantity' => 1]] : null,
                    'currency' => data_get($event->metadata, 'currency', 'HUF'),
                    'value' => data_get($event->metadata, 'value'),
                    'search_string' => data_get($event->metadata, 'search_term'),
                ]),
            ]],
        ];

        $testEventCode = (string) config('analytics.meta.test_event_code');

        if ($testEventCode !== '') {
            $payload['test_event_code'] = $testEventCode;
        }

        try {
            $this->http
                ->asJson()
                ->timeout((int) config('analytics.meta.endpoint_timeout_seconds'))
                ->post($endpoint, array_merge($payload, [
                    'access_token' => $accessToken,
                ]))
                ->throw();
        } catch (Throwable $throwable) {
            Log::warning('Meta Conversions API request failed.', [
                'analytics_event_id' => $event->id,
                'event_id' => $event->event_id,
                'event_name' => $event->event_name,
                'message' => $throwable->getMessage(),
            ]);
        }
    }
}
