<?php

namespace App\Http\Requests\Admin\Booking;

class UpdateBookingRequest extends StoreBookingRequest
{
    protected function prepareForValidation(): void
    {
        parent::prepareForValidation();

        $this->merge([
            'booking_type' => $this->input('booking_type', $this->input('bookingType', $this->route('booking_type'))),
        ]);
    }
}
