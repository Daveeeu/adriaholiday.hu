<?php

namespace App\Http\Resources;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Customer
 */
class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'email' => $this->email,
            'name' => $this->name,
            'phone' => $this->phone,
            'postalCode' => $this->postal_code,
            'city' => $this->city,
            'address' => $this->address,
            'referralCode' => $this->referral_code,
            'registrationCouponValue' => $this->registration_coupon_value,
            'note' => $this->note,
            'bookingsCount' => $this->whenCounted('bookings'),
            'registeredAt' => $this->registered_at?->toISOString(),
            'firstLoginAt' => $this->first_login_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
