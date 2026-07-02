<?php

namespace App\Services\Analytics;

use App\Support\Analytics\AnalyticsEventName;

class MetaEventMapper
{
    public function toMetaEventName(string $eventName): ?string
    {
        return match ($eventName) {
            AnalyticsEventName::PAGE_VIEW => 'PageView',
            AnalyticsEventName::OFFER_VIEW,
            AnalyticsEventName::HOMEPAGE_OFFER_VIEW => 'ViewContent',
            AnalyticsEventName::SEARCH => 'Search',
            AnalyticsEventName::LEAD_START,
            AnalyticsEventName::LEAD_SUBMIT => 'Lead',
            AnalyticsEventName::PHONE_CLICK,
            AnalyticsEventName::EMAIL_CLICK,
            AnalyticsEventName::WHATSAPP_CLICK => 'Contact',
            AnalyticsEventName::BOOKING_START,
            AnalyticsEventName::BOOKING_ANCHOR_CLICK => 'InitiateCheckout',
            AnalyticsEventName::BOOKING_SUCCESS => 'Purchase',
            default => null,
        };
    }
}
