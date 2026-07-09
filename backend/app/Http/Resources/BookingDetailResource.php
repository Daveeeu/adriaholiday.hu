<?php

namespace App\Http\Resources;

use App\Services\Booking\BookingFormValidationService;
use Illuminate\Http\Request;

class BookingDetailResource extends BookingResource
{
    public function toArray(Request $request): array
    {
        $labels = $this->resolveFieldLabels();
        $payload = $this->payload ?? [];

        return parent::toArray($request) + [
            'region' => $this->whenLoaded('region', fn () => new RegionResource($this->region)),
            'location' => $this->whenLoaded('location', fn () => new LocationResource($this->location)),
            'apartment' => $this->whenLoaded('apartment', fn () => new ApartmentResource($this->apartment)),
            'tour' => $this->whenLoaded('tour', fn () => new TourResource($this->tour)),
            'tourDateId' => $this->tour_date_id,
            'tourDate' => $this->whenLoaded('tourDate', fn () => $this->tourDate ? [
                'id' => $this->tourDate->id,
                'startDate' => $this->tourDate->start_date?->toDateString(),
                'endDate' => $this->tourDate->end_date?->toDateString(),
                'status' => $this->tourDate->status,
                'availableSeats' => $this->tourDate->price_box_available_seats,
                'capacity' => $this->tourDate->price_box_capacity,
            ] : null),
            'adminNote' => $this->admin_note,
            'seatsReserved' => (bool) $this->seats_reserved,
            'formDataFields' => collect($payload['formData'] ?? [])
                ->map(fn ($value, $key) => [
                    'key' => $key,
                    'label' => $labels[$key] ?? $key,
                    'value' => $value,
                ])
                ->values()
                ->all(),
            'passengerFields' => collect($payload['passengers'] ?? [])
                ->map(fn (array $passenger) => collect($passenger)
                    ->map(fn ($value, $key) => [
                        'key' => $key,
                        'label' => $labels[$key] ?? $key,
                        'value' => $value,
                    ])
                    ->values()
                    ->all())
                ->values()
                ->all(),
        ];
    }

    /**
     * @return array<string, string>
     */
    private function resolveFieldLabels(): array
    {
        $template = $this->tour?->bookingFormTemplate;

        if (! $template) {
            return BookingFormValidationService::defaultFieldLabels();
        }

        return $template->templateFields
            ->filter(fn ($templateField) => $templateField->field !== null)
            ->mapWithKeys(fn ($templateField) => [$templateField->field->key => $templateField->field->label])
            ->all();
    }
}
