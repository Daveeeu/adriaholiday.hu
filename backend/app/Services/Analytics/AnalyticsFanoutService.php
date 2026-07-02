<?php

namespace App\Services\Analytics;

use App\Models\AnalyticsEvent;
use App\Services\Analytics\Destinations\AnalyticsDestination;
use App\Services\Analytics\Destinations\MetaConversionsApiDestination;

class AnalyticsFanoutService
{
    /**
     * @return array<int, AnalyticsDestination>
     */
    private function destinations(): array
    {
        return [
            app(MetaConversionsApiDestination::class),
        ];
    }

    public function dispatch(AnalyticsEvent $event): void
    {
        foreach ($this->destinations() as $destination) {
            if (! $destination->supports($event)) {
                continue;
            }

            $destination->dispatch($event);
        }
    }
}
