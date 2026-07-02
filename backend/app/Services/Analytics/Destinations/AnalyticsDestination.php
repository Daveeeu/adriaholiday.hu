<?php

namespace App\Services\Analytics\Destinations;

use App\Models\AnalyticsEvent;

interface AnalyticsDestination
{
    public function supports(AnalyticsEvent $event): bool;

    public function dispatch(AnalyticsEvent $event): void;
}
