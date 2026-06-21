<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerFinanceRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'partnerName' => $this->partner_name,
            'date' => $this->date?->toDateString(),
            'amount' => $this->amount !== null ? (float) $this->amount : null,
            'type' => $this->type,
            'status' => $this->status,
            'balance' => $this->balance !== null ? (float) $this->balance : null,
            'note' => $this->note,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
