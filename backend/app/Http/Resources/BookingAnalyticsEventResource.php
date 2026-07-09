<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingAnalyticsEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'eventId' => $this->event_id,
            'eventName' => $this->event_name,
            'source' => $this->utm_source ?: ($this->referrer ?: null),
            'utmSource' => $this->utm_source,
            'utmMedium' => $this->utm_medium,
            'utmCampaign' => $this->utm_campaign,
            'referrer' => $this->referrer,
            'ipHash' => $this->ip_hash,
            'userAgent' => $this->user_agent,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
