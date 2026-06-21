<?php

namespace App\Http\Requests\Admin\Booking;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $bookingType = $this->input('booking_type', $this->input('bookingType', $this->route('booking_type')));

        $this->merge([
            'booking_type' => $bookingType,
            'status' => $this->input('status', match ($bookingType) {
                'tour_inquiry', 'apartment_booking' => 'new',
                default => 'pending',
            }),
            'payment_status' => $this->input('payment_status', $this->input('paymentStatus')),
            'region_id' => $this->input('region_id', $this->input('regionId')),
            'location_id' => $this->input('location_id', $this->input('locationId')),
            'offer_id' => $this->input('offer_id', $this->input('offerId')),
            'offer_date_id' => $this->input('offer_date_id', $this->input('offerDateId')),
            'apartment_id' => $this->input('apartment_id', $this->input('apartmentId')),
            'tour_id' => $this->input('tour_id', $this->input('tourId')),
            'customer_name' => $this->input('customer_name', $this->input('customerName', $this->input('partnerName', $this->input('guestName', $this->input('name'))))),
            'email' => $this->input('email', $this->input('partnerEmail')),
            'phone' => $this->input('phone', $this->input('partnerPhone')),
            'country' => $this->input('country', $this->input('partnerCountry')),
            'address' => $this->input('address', $this->input('partnerAddress')),
            'city' => $this->input('city', $this->input('partnerCity')),
            'adults' => $this->input('adults', 0),
            'children' => $this->input('children', 0),
            'passenger_count' => $this->input('passenger_count', $this->input('passengerCount', $this->input('passengers'))),
            'check_in' => $this->input('check_in', $this->input('checkIn')),
            'check_out' => $this->input('check_out', $this->input('checkOut')),
            'departure_date' => $this->input('departure_date', $this->input('departureDate')),
            'arrival' => $this->input('arrival'),
            'departure' => $this->input('departure'),
            'appointment_time' => $this->input('appointment_time', $this->input('appointmentTime')),
            'application_date' => $this->input('application_date', $this->input('applicationDate', $this->input('applicationTime'))),
            'booking_date' => $this->input('booking_date', $this->input('bookingDate')),
            'property_name_snapshot' => $this->input('property_name_snapshot', $this->input('propertyName')),
            'offer_name_snapshot' => $this->input('offer_name_snapshot', $this->input('offerName')),
            'apartment_name_snapshot' => $this->input('apartment_name_snapshot', $this->input('apartmentName')),
            'partner_name_snapshot' => $this->input('partner_name_snapshot', $this->input('partnerName')),
            'offer_code' => $this->input('offer_code', $this->input('offerCode')),
            'total_amount' => $this->input('total_amount', $this->input('totalAmount')),
            'paid_amount' => $this->input('paid_amount', $this->input('paidAmount')),
            'currency' => $this->input('currency', 'EUR'),
            'credited' => $this->boolean('credited'),
            'cancelled' => $this->boolean('cancelled'),
            'notes' => $this->input('notes', $this->input('partnerNote')),
            'message' => $this->input('message'),
            'payload' => $this->input('payload'),
        ]);

        if (! $this->filled('payment_status')) {
            $this->merge([
                'payment_status' => $bookingType === 'tour_booking' ? 'unpaid' : null,
            ]);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'booking_type' => ['required', 'string', Rule::in(['tour_booking', 'tour_inquiry', 'apartment_booking'])],
            'status' => ['required', 'string', 'max:255'],
            'payment_status' => ['nullable', 'string', 'max:255'],
            'region_id' => ['nullable', 'integer', 'exists:regions,id'],
            'location_id' => ['nullable', 'integer', 'exists:locations,id'],
            'offer_id' => ['nullable', 'integer'],
            'offer_date_id' => ['nullable', 'integer'],
            'apartment_id' => ['nullable', 'integer', 'exists:apartments,id'],
            'tour_id' => ['nullable', 'integer', 'exists:tours,id'],
            'customer_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'country' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:255'],
            'adults' => ['integer', 'min:0'],
            'children' => ['integer', 'min:0'],
            'passenger_count' => ['nullable', 'integer', 'min:0'],
            'check_in' => ['nullable', 'date'],
            'check_out' => ['nullable', 'date', 'after_or_equal:check_in'],
            'departure_date' => ['nullable', 'date'],
            'arrival' => ['nullable', 'date'],
            'departure' => ['nullable', 'date'],
            'appointment_time' => ['nullable', 'date'],
            'application_date' => ['nullable', 'date'],
            'booking_date' => ['nullable', 'date'],
            'property_name_snapshot' => ['nullable', 'string', 'max:255'],
            'offer_name_snapshot' => ['nullable', 'string', 'max:255'],
            'apartment_name_snapshot' => ['nullable', 'string', 'max:255'],
            'partner_name_snapshot' => ['nullable', 'string', 'max:255'],
            'offer_code' => ['nullable', 'string', 'max:255'],
            'total_amount' => ['nullable', 'numeric'],
            'paid_amount' => ['nullable', 'numeric'],
            'currency' => ['nullable', 'string', 'max:10'],
            'credited' => ['boolean'],
            'cancelled' => ['boolean'],
            'notes' => ['nullable', 'string'],
            'message' => ['nullable', 'string'],
            'payload' => ['nullable', 'array'],
        ];
    }
}
