<?php

namespace App\Http\Requests\Admin\Booking;

/**
 * Changes only the fields the admin sent: anything left out of the request –
 * the price breakdown, the paid amount, the trip and its date – stays as stored.
 */
class UpdateBookingRequest extends StoreBookingRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'booking_type' => $this->input('booking_type', $this->input('bookingType', $this->route('booking_type'))),
        ]);
    }

    protected function defaults(?string $bookingType): array
    {
        return [];
    }

    public function rules(): array
    {
        return collect(parent::rules())
            ->map(fn (array $rules, string $field): array => $field === 'booking_type' ? $rules : ['sometimes', ...$rules])
            ->all();
    }
}
