<?php

namespace App\Http\Resources;

use App\Services\Booking\BookingDetailsRequestService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * What the public "Hiányzó adatok" page shows: the booking it belongs to and
 * the fields still to be given, shaped like the booking form's fields.
 */
class PublicBookingDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $service = app(BookingDetailsRequestService::class);
        $pending = $service->pendingFields($this->resource);

        return [
            'bookingId' => $this->id,
            'tourName' => $this->offer_name_snapshot,
            'departureDate' => $this->departure_date?->toDateString(),
            'customerName' => $this->customer_name,
            'formDataFields' => $pending['formData'],
            'passengers' => collect($pending['passengers'])
                ->map(fn (array $fields, int $index): array => [
                    'index' => $index,
                    'title' => $service->passengerTitle($this->resource, $index),
                    'fields' => $fields,
                ])
                ->values()
                ->all(),
        ];
    }
}
