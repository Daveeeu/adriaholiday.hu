<x-mail::message>
# Köszönjük a foglalást!

Kedves {{ $booking->customer_name ?? 'Utazó' }}!

Megkaptuk a foglalásod a következő utazásra: **{{ $tour->name }}**
@if ($booking->departure_date)
(indulás: {{ $booking->departure_date->format('Y.m.d.') }})
@endif

Munkatársunk hamarosan felveszi veled a kapcsolatot a visszaigazolás érdekében.

Foglalásod azonosítója: #{{ $booking->id }}

Üdvözlettel,<br>
{{ config('app.name') }}
</x-mail::message>
