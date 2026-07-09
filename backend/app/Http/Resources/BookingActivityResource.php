<?php

namespace App\Http\Resources;

use App\Support\Booking\TourBookingStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $properties = $this->properties ?? collect();
        $attributes = $properties->get('attributes', []);
        $old = $properties->get('old', []);

        return [
            'id' => (string) $this->id,
            'event' => $this->event,
            'description' => $this->describe($attributes, $old),
            'causerName' => $this->causer?->name,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @param  array<string, mixed>  $old
     */
    private function describe(array $attributes, array $old): string
    {
        if ($this->event === 'created') {
            return 'A foglalás létrejött.';
        }

        if ($this->event === 'deleted') {
            return 'A foglalás törölve lett.';
        }

        if (isset($attributes['status']) && isset($old['status']) && $attributes['status'] !== $old['status']) {
            return sprintf(
                'Státusz módosult: %s → %s',
                $this->statusLabel((string) $old['status']),
                $this->statusLabel((string) $attributes['status']),
            );
        }

        $changedFields = array_keys($attributes);

        if ($changedFields === []) {
            return 'A foglalás módosult.';
        }

        return 'Módosított mezők: '.implode(', ', $changedFields);
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            TourBookingStatus::NEW => 'Új',
            TourBookingStatus::CONTACTED => 'Felvéve a kapcsolat',
            TourBookingStatus::CONFIRMED => 'Megerősítve',
            TourBookingStatus::CANCELLED => 'Lemondva',
            TourBookingStatus::EXPIRED => 'Lejárt',
            default => $status,
        };
    }
}
