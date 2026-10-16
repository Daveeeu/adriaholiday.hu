<?php

namespace App\Support\Booking;

use App\Models\Apartment;
use App\Models\Booking;
use App\Support\Mail\EmailCompany;

/**
 * What the apartment booking emails show: the stay, the customer, the guests
 * and the insurances asked for, as label/value rows.
 */
final class ApartmentBookingMailData
{
    public function __construct(
        private readonly Booking $booking,
        private readonly Apartment $apartment,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $booking = $this->booking;
        $payload = $booking->payload ?? [];
        $nights = $booking->arrival && $booking->departure ? (int) $booking->arrival->diffInDays($booking->departure) : null;
        $location = $this->apartment->location;

        return [
            'booking' => $booking,
            'apartmentName' => $this->apartment->name,
            'customerName' => $booking->customer_name,
            'company' => EmailCompany::resolve(),
            'stayRows' => array_values(array_filter([
                ['label' => 'Apartman', 'value' => $this->apartment->name],
                $location ? ['label' => 'Helyszín', 'value' => $location->name] : null,
                $this->apartment->code ? ['label' => 'Kódszám', 'value' => $this->apartment->code] : null,
                isset($payload['apartmentType']) ? ['label' => 'Apartmantípus', 'value' => $payload['apartmentType']] : null,
                ['label' => 'Érkezés', 'value' => $booking->arrival?->format('Y.m.d.')],
                ['label' => 'Távozás', 'value' => $booking->departure?->format('Y.m.d.').($nights ? " ({$nights} éj)" : '')],
                ['label' => 'Személyek száma', 'value' => $booking->passenger_count.' fő'],
                ['label' => 'Utasbiztosítás', 'value' => ($payload['travelInsurance'] ?? false) ? 'kéri' : 'nem kéri'],
                ['label' => 'Útlemondási biztosítás', 'value' => ($payload['cancellationInsurance'] ?? false) ? 'kéri' : 'nem kéri'],
            ])),
            'contactRows' => array_values(array_filter([
                ['label' => 'Név', 'value' => $booking->customer_name],
                ['label' => 'E-mail', 'value' => $booking->email],
                $booking->phone ? ['label' => 'Telefon', 'value' => $booking->phone] : null,
                ($address = $this->address()) !== '' ? ['label' => 'Cím', 'value' => $address] : null,
            ])),
            'passengers' => array_map(fn (array $passenger): array => array_values(array_filter([
                ['label' => 'Név', 'value' => $passenger['name'] ?? null],
                ['label' => 'Születési dátum', 'value' => isset($passenger['birthDate']) ? str_replace('-', '.', $passenger['birthDate']).'.' : null],
                isset($passenger['address']) ? ['label' => 'Lakcím', 'value' => $passenger['address']] : null,
                isset($passenger['documentNumber']) ? ['label' => 'Útiokmány száma', 'value' => $passenger['documentNumber']] : null,
            ])), $payload['passengers'] ?? []),
            'note' => $booking->message,
        ];
    }

    private function address(): string
    {
        return collect([$this->booking->payload['postalCode'] ?? null, $this->booking->city, $this->booking->address])->filter()->implode(', ');
    }
}
