<?php

namespace App\Http\Resources;

use App\Support\Booking\TourBookingStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $changes = $this->attribute_changes ?? collect();
        $attributes = $changes->get('attributes', []);
        $old = $changes->get('old', []);

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
            return 'Foglalás létrejött';
        }

        if ($this->event === 'deleted') {
            return 'Foglalás törölve';
        }

        $seatsNote = $this->seatsChangeNote($attributes, $old);

        if (isset($attributes['status']) && isset($old['status']) && $attributes['status'] !== $old['status']) {
            $title = $this->statusTransitionTitle((string) $attributes['status']);

            return $seatsNote !== null ? "{$title} ({$seatsNote})" : $title;
        }

        if ($seatsNote !== null) {
            return ucfirst($seatsNote);
        }

        if (array_key_exists('admin_note', $attributes)) {
            return 'Admin megjegyzés frissítve';
        }

        $changedFields = array_keys($attributes);

        if ($changedFields === []) {
            return 'Foglalás módosítva';
        }

        return 'Módosított mezők: '.implode(', ', array_map(fn (string $field): string => $this->fieldLabel($field), $changedFields));
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @param  array<string, mixed>  $old
     */
    private function seatsChangeNote(array $attributes, array $old): ?string
    {
        if (! array_key_exists('seats_reserved', $attributes) || ! array_key_exists('seats_reserved', $old)) {
            return null;
        }

        if ($attributes['seats_reserved'] && ! $old['seats_reserved']) {
            return 'helyek lefoglalva';
        }

        if (! $attributes['seats_reserved'] && $old['seats_reserved']) {
            return 'helyek felszabadítva';
        }

        return null;
    }

    private function statusTransitionTitle(string $status): string
    {
        return match ($status) {
            TourBookingStatus::CONTACTED => 'Kapcsolatfelvétel',
            TourBookingStatus::CONFIRMED => 'Visszaigazolva',
            TourBookingStatus::CANCELLED => 'Lemondva',
            TourBookingStatus::EXPIRED => 'Lejárt',
            default => 'Státusz módosítva: '.$this->statusLabel($status),
        };
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

    private function fieldLabel(string $field): string
    {
        return match ($field) {
            'admin_note' => 'Admin megjegyzés',
            'status' => 'Státusz',
            'seats_reserved' => 'Helyfoglalás',
            'customer_name' => 'Kapcsolattartó neve',
            'email' => 'Email',
            'phone' => 'Telefon',
            'city' => 'Város',
            'notes' => 'Megjegyzés',
            default => $field,
        };
    }
}
