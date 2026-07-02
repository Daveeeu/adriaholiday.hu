<?php

namespace App\Services\Analytics;

use App\Http\Requests\Analytics\StoreAnalyticsEventRequest;
use App\Jobs\SendMetaConversionEventJob;
use App\Models\AnalyticsEvent;

class AnalyticsIngestionService
{
    public function __construct(
        private readonly MetaEventMapper $metaEventMapper,
    ) {
    }

    public function capture(StoreAnalyticsEventRequest $request): array
    {
        if (! config('analytics.enabled')) {
            return [
                'accepted' => false,
                'stored' => false,
                'queued' => false,
                'reason' => 'analytics_disabled',
            ];
        }

        $payload = $request->validated();
        $consent = $payload['consent'];

        if (! ($consent['analytics'] ?? false)) {
            return [
                'accepted' => true,
                'stored' => false,
                'queued' => false,
                'reason' => 'analytics_consent_denied',
                'event_id' => $payload['event_id'],
            ];
        }

        $event = AnalyticsEvent::query()->create([
            'event_id' => $payload['event_id'],
            'session_id' => $payload['session_id'],
            'visitor_id' => $payload['visitor_id'],
            'user_id' => $request->user()?->id,
            'event_name' => $payload['event_name'],
            'entity_type' => data_get($payload, 'entity.type'),
            'entity_id' => data_get($payload, 'entity.id'),
            'entity_slug' => data_get($payload, 'entity.slug'),
            'page_url' => data_get($payload, 'page.url'),
            'page_path' => data_get($payload, 'page.path'),
            'referrer' => data_get($payload, 'page.referrer'),
            'utm_source' => data_get($payload, 'attribution.utm_source'),
            'utm_medium' => data_get($payload, 'attribution.utm_medium'),
            'utm_campaign' => data_get($payload, 'attribution.utm_campaign'),
            'utm_content' => data_get($payload, 'attribution.utm_content'),
            'utm_term' => data_get($payload, 'attribution.utm_term'),
            'metadata' => $payload['metadata'] ?? [],
            'fbp' => data_get($payload, 'meta.fbp'),
            'fbc' => data_get($payload, 'meta.fbc'),
            'ip_hash' => $this->hashIp($request->ip()),
            'user_agent' => $request->userAgent(),
            'consent_analytics' => (bool) ($consent['analytics'] ?? false),
            'consent_marketing' => (bool) ($consent['marketing'] ?? false),
        ]);

        $queued = $this->shouldQueueMetaConversion($event);

        if ($queued) {
            SendMetaConversionEventJob::dispatch($event->id)
                ->onQueue(config('analytics.queue'));
        }

        return [
            'accepted' => true,
            'stored' => true,
            'queued' => $queued,
            'event_id' => $event->event_id,
            'id' => $event->id,
        ];
    }

    private function hashIp(?string $ipAddress): ?string
    {
        if (! $ipAddress) {
            return null;
        }

        $appKey = (string) config('app.key');

        return hash_hmac('sha256', $ipAddress, $appKey !== '' ? $appKey : 'analytics');
    }

    private function shouldQueueMetaConversion(AnalyticsEvent $event): bool
    {
        if (! $event->consent_analytics || ! $event->consent_marketing) {
            return false;
        }

        if (! (bool) config('analytics.meta.capi_enabled')) {
            return false;
        }

        if ($this->metaEventMapper->toMetaEventName($event->event_name) === null) {
            return false;
        }

        $pixelId = trim((string) config('analytics.meta.pixel_id'));
        $accessToken = trim((string) config('analytics.meta.access_token'));

        return $pixelId !== '' && $accessToken !== '';
    }
}
