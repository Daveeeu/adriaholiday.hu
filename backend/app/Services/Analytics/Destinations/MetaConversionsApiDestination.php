<?php

namespace App\Services\Analytics\Destinations;

use App\Models\AnalyticsEvent;
use App\Services\Analytics\MetaConversionsApiService;
use App\Services\Analytics\MetaEventMapper;

class MetaConversionsApiDestination implements AnalyticsDestination
{
    public function __construct(
        private readonly MetaConversionsApiService $metaConversionsApiService,
        private readonly MetaEventMapper $metaEventMapper,
    ) {
    }

    public function supports(AnalyticsEvent $event): bool
    {
        return (bool) config('analytics.meta.capi_enabled')
            && $event->consent_analytics
            && $event->consent_marketing
            && $this->metaEventMapper->toMetaEventName($event->event_name) !== null;
    }

    public function dispatch(AnalyticsEvent $event): void
    {
        $metaEventName = $this->metaEventMapper->toMetaEventName($event->event_name);

        if ($metaEventName === null) {
            return;
        }

        $this->metaConversionsApiService->send($event, $metaEventName);
    }
}
