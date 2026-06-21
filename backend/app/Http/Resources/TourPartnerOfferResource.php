<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourPartnerOfferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'partnerName' => $this->partner_name,
            'partnerEmail' => $this->partner_email,
            'inquiryDate' => $this->inquiry_date?->toDateString(),
            'status' => $this->status,
            'note' => $this->note,
            'active' => (bool) $this->active,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
