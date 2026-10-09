<?php

namespace App\Http\Resources;

use App\Services\Booking\BookingFormValidationService;
use App\Support\Booking\BookingDocumentData;
use App\Support\Booking\BookingPriceSummary;
use App\Support\TourMeta;
use Illuminate\Http\Request;

class BookingDetailResource extends BookingResource
{
    public function toArray(Request $request): array
    {
        $labels = BookingFormValidationService::fieldLabels();
        $payload = $this->payload ?? [];
        $tour = $this->tour;
        $selections = BookingPriceSummary::of($this->resource)?->passengerSelections() ?? [];

        return parent::toArray($request) + [
            'region' => $this->whenLoaded('region', fn () => new RegionResource($this->region)),
            'location' => $this->whenLoaded('location', fn () => new LocationResource($this->location)),
            'apartment' => $this->whenLoaded('apartment', fn () => new ApartmentResource($this->apartment)),
            'tour' => $this->whenLoaded('tour', fn () => new TourResource($this->tour)),
            'tourTransportLabel' => $this->whenLoaded('tour', fn () => $tour ? TourMeta::transportLabel($tour) : null),
            'tourCountry' => $this->whenLoaded('tour', fn () => $tour ? TourMeta::country($tour) : null),
            'tourDateId' => $this->tour_date_id,
            'tourDate' => $this->whenLoaded('tourDate', fn () => $this->tourDate ? [
                'id' => $this->tourDate->id,
                'startDate' => $this->tourDate->start_date?->toDateString(),
                'endDate' => $this->tourDate->end_date?->toDateString(),
                'status' => $this->tourDate->status,
                'availableSeats' => $this->tourDate->price_box_available_seats,
                'capacity' => $this->tourDate->price_box_capacity,
                'maxParticipants' => $this->tourDate->price_box_max_participants,
            ] : null),
            'adminNote' => $this->admin_note,
            'seatsReserved' => (bool) $this->seats_reserved,
            'pricing' => $payload['pricing'] ?? null,
            'payments' => $this->whenLoaded('payments', fn () => BookingPaymentResource::collection($this->payments)->resolve()),
            'formDataFields' => collect($payload['formData'] ?? [])
                ->map(fn ($value, $key) => [
                    'key' => $key,
                    'label' => $labels[$key] ?? $key,
                    'value' => $value,
                ])
                ->values()
                ->all(),
            'passengerFields' => collect($payload['passengers'] ?? [])
                ->values()
                ->map(fn (array $passenger, int $index) => collect($passenger)
                    ->map(fn ($value, $key) => [
                        'key' => $key,
                        'label' => $labels[$key] ?? $key,
                        'value' => $value,
                    ])
                    ->values()
                    ->when(isset($selections[$index]), fn ($fields) => $fields->push([
                        'key' => 'selections',
                        'label' => BookingDocumentData::PASSENGER_SELECTIONS_LABEL,
                        'value' => implode(', ', $selections[$index]),
                    ]))
                    ->all())
                ->all(),
        ];
    }
}
