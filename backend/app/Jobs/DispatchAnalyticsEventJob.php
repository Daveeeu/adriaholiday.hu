<?php

namespace App\Jobs;

use App\Models\AnalyticsEvent;
use App\Services\Analytics\AnalyticsFanoutService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class DispatchAnalyticsEventJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly int $analyticsEventId,
    ) {
    }

    public function handle(AnalyticsFanoutService $fanoutService): void
    {
        $event = AnalyticsEvent::query()->find($this->analyticsEventId);

        if (! $event) {
            return;
        }

        $fanoutService->dispatch($event);
    }
}
