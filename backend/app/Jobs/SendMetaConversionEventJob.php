<?php

namespace App\Jobs;

use App\Models\AnalyticsEvent;
use App\Services\Analytics\MetaConversionsApiService;
use App\Services\Analytics\MetaEventMapper;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendMetaConversionEventJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int $analyticsEventId,
    ) {
    }

    public function handle(
        MetaConversionsApiService $metaConversionsApiService,
        MetaEventMapper $metaEventMapper,
    ): void {
        $event = AnalyticsEvent::query()->find($this->analyticsEventId);

        if (! $event) {
            return;
        }

        $metaEventName = $metaEventMapper->toMetaEventName($event->event_name);

        if ($metaEventName === null) {
            return;
        }

        try {
            $metaConversionsApiService->send($event, $metaEventName);
        } catch (Throwable $throwable) {
            Log::warning('Meta conversion event dispatch failed.', [
                'analytics_event_id' => $event->id,
                'event_id' => $event->event_id,
                'event_name' => $event->event_name,
                'message' => $throwable->getMessage(),
            ]);
        }
    }
}
