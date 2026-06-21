<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'bookingType' => $this->booking_type,
            'status' => $this->status,
            'paymentStatus' => $this->payment_status,
            'regionId' => $this->region_id,
            'locationId' => $this->location_id,
            'offerId' => $this->offer_id,
            'offerDateId' => $this->offer_date_id,
            'apartmentId' => $this->apartment_id,
            'tourId' => $this->tour_id,
            'customerName' => $this->customer_name,
            'name' => $this->customer_name,
            'guestName' => $this->customer_name,
            'partnerName' => $this->partner_name_snapshot ?? $this->customer_name,
            'partnerEmail' => $this->email,
            'partnerPhone' => $this->phone,
            'partnerAddress' => $this->address,
            'partnerCity' => $this->city,
            'partnerCountry' => $this->country,
            'partnerNote' => $this->notes,
            'email' => $this->email,
            'phone' => $this->phone,
            'country' => $this->country,
            'address' => $this->address,
            'city' => $this->city,
            'adults' => (int) $this->adults,
            'children' => (int) $this->children,
            'passengerCount' => $this->passenger_count,
            'passengers' => $this->passenger_count,
            'checkIn' => $this->check_in?->toDateString(),
            'checkOut' => $this->check_out?->toDateString(),
            'departureDate' => $this->departure_date?->toDateString(),
            'arrival' => $this->arrival?->toDateString(),
            'departure' => $this->departure?->toDateString(),
            'appointmentTime' => $this->appointment_time?->toISOString(),
            'applicationDate' => $this->application_date?->toDateString() ?? $this->created_at?->toDateString(),
            'applicationTime' => $this->application_date?->toISOString(),
            'bookingDate' => $this->booking_date?->toDateString(),
            'propertyNameSnapshot' => $this->property_name_snapshot,
            'propertyName' => $this->property_name_snapshot,
            'offerName' => $this->offer_name_snapshot,
            'apartmentName' => $this->apartment_name_snapshot,
            'offerCode' => $this->offer_code,
            'totalAmount' => $this->total_amount !== null ? (float) $this->total_amount : null,
            'paidAmount' => $this->paid_amount !== null ? (float) $this->paid_amount : null,
            'currency' => $this->currency,
            'credited' => (bool) $this->credited,
            'cancelled' => (bool) $this->cancelled,
            'notes' => $this->notes,
            'message' => $this->message,
            'payload' => $this->payload ?? [],
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
