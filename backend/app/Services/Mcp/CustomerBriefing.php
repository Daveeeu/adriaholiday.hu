<?php

namespace App\Services\Mcp;

use App\Models\Customer;

/**
 * Customers (the legacy site's registered accounts) as the AI assistant
 * reads them; their bookings are the ones made with their e-mail address.
 */
class CustomerBriefing
{
    public function __construct(private readonly McpLinks $links) {}

    /**
     * @return array<string, mixed>
     */
    public function summary(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'city' => $customer->city,
            'booking_count' => $customer->bookings_count,
            'registered_at' => $customer->registered_at?->toDateString(),
            'admin_url' => $this->links->admin('bookings/customers'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function details(Customer $customer): array
    {
        return [
            ...$this->summary($customer),
            'postal_code' => $customer->postal_code,
            'address' => $customer->address,
            'referral_code' => $customer->referral_code,
            'registration_coupon_value' => $customer->registration_coupon_value,
            'note' => $customer->note,
            'first_login_at' => $customer->first_login_at?->toDateString(),
        ];
    }
}
