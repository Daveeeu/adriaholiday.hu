<?php

namespace App\Http\Requests\Admin\Booking;

use App\Support\Booking\TourBookingStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends FormRequest
{
    /**
     * Each stored field and the request keys the admin UIs send it under, first match wins.
     *
     * @var array<string, array<int, string>>
     */
    private const FIELD_ALIASES = [
        'status' => ['status'],
        'payment_status' => ['payment_status', 'paymentStatus'],
        'region_id' => ['region_id', 'regionId'],
        'location_id' => ['location_id', 'locationId'],
        'offer_id' => ['offer_id', 'offerId'],
        'offer_date_id' => ['offer_date_id', 'offerDateId'],
        'apartment_id' => ['apartment_id', 'apartmentId'],
        'tour_id' => ['tour_id', 'tourId'],
        'tour_date_id' => ['tour_date_id', 'tourDateId'],
        'admin_note' => ['admin_note', 'adminNote'],
        'customer_name' => ['customer_name', 'customerName', 'partnerName', 'guestName', 'name'],
        'email' => ['email', 'partnerEmail'],
        'phone' => ['phone', 'partnerPhone'],
        'country' => ['country', 'partnerCountry'],
        'address' => ['address', 'partnerAddress'],
        'city' => ['city', 'partnerCity'],
        'adults' => ['adults'],
        'children' => ['children'],
        'passenger_count' => ['passenger_count', 'passengerCount', 'passengers'],
        'check_in' => ['check_in', 'checkIn'],
        'check_out' => ['check_out', 'checkOut'],
        'departure_date' => ['departure_date', 'departureDate'],
        'arrival' => ['arrival'],
        'departure' => ['departure'],
        'appointment_time' => ['appointment_time', 'appointmentTime'],
        'application_date' => ['application_date', 'applicationDate', 'applicationTime'],
        'booking_date' => ['booking_date', 'bookingDate'],
        'property_name_snapshot' => ['property_name_snapshot', 'propertyName'],
        'offer_name_snapshot' => ['offer_name_snapshot', 'offerName'],
        'apartment_name_snapshot' => ['apartment_name_snapshot', 'apartmentName'],
        'partner_name_snapshot' => ['partner_name_snapshot', 'partnerName'],
        'offer_code' => ['offer_code', 'offerCode'],
        'total_amount' => ['total_amount', 'totalAmount'],
        'paid_amount' => ['paid_amount', 'paidAmount'],
        'currency' => ['currency'],
        'credited' => ['credited'],
        'cancelled' => ['cancelled'],
        'notes' => ['notes', 'partnerNote'],
        'message' => ['message'],
        'payload' => ['payload'],
    ];

    protected function prepareForValidation(): void
    {
        $bookingType = $this->input('booking_type', $this->input('bookingType', $this->route('booking_type')));

        $this->merge([
            'booking_type' => $bookingType,
            ...$this->defaults($bookingType),
            ...$this->sentFields(),
        ]);

        if (! $this->filled('payment_status') && $this->has('payment_status')) {
            $this->merge(['payment_status' => $bookingType === 'tour_booking' ? 'unpaid' : null]);
        }
    }

    /**
     * Values of a new booking for the fields the request leaves out.
     *
     * @return array<string, mixed>
     */
    protected function defaults(?string $bookingType): array
    {
        return [
            'status' => $bookingType === 'tour_booking' ? TourBookingStatus::NEW : 'new',
            'payment_status' => null,
            'adults' => 0,
            'children' => 0,
            'currency' => 'EUR',
            'credited' => false,
            'cancelled' => false,
        ];
    }

    /**
     * The fields the request carries, under their stored names; fields it
     * does not mention are left out, so an update keeps their stored values.
     *
     * @return array<string, mixed>
     */
    private function sentFields(): array
    {
        $fields = [];

        foreach (self::FIELD_ALIASES as $field => $aliases) {
            foreach ($aliases as $alias) {
                if ($this->exists($alias)) {
                    $fields[$field] = in_array($field, ['credited', 'cancelled'], true) ? $this->boolean($alias) : $this->input($alias);
                    break;
                }
            }
        }

        return $fields;
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $statusRules = ['required', 'string', 'max:255'];

        if ($this->input('booking_type') === 'tour_booking') {
            $statusRules[] = Rule::in(TourBookingStatus::all());
        }

        return [
            'booking_type' => ['required', 'string', Rule::in(['tour_booking', 'tour_inquiry', 'apartment_booking'])],
            'status' => $statusRules,
            'payment_status' => ['nullable', 'string', 'max:255'],
            'tour_date_id' => ['nullable', 'integer', 'exists:tour_dates,id'],
            'admin_note' => ['nullable', 'string', 'max:5000'],
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
            'paid_amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
            'credited' => ['boolean'],
            'cancelled' => ['boolean'],
            'notes' => ['nullable', 'string'],
            'message' => ['nullable', 'string'],
            'payload' => ['nullable', 'array'],
        ];
    }
}
