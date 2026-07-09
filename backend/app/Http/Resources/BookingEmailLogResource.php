<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingEmailLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'to' => $this->to,
            'subject' => $this->subject,
            'status' => $this->status,
            'error' => $this->error,
            'sentAt' => $this->sent_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
