<?php

namespace App\Http\Resources;

use App\Models\BookingPayment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin BookingPayment
 */
class BookingPaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'provider' => $this->provider,
            'providerPaymentId' => $this->provider_payment_id,
            'status' => $this->status,
            'providerStatus' => $this->provider_status,
            'kind' => $this->kind,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'completedAt' => $this->completed_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
