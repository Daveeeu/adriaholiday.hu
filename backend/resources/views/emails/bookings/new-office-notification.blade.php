@php
    $formData = collect($booking->payload['formData'] ?? []);
    $passengers = collect($booking->payload['passengers'] ?? []);
@endphp
<x-mail::message>
# Új foglalás érkezett

**{{ $tour->name }}**
@if ($booking->departure_date)
Indulás: {{ $booking->departure_date->format('Y.m.d.') }}
@endif

## Kapcsolattartó

- Név: {{ $booking->customer_name ?? '-' }}
- Email: {{ $booking->email ?? '-' }}
- Telefon: {{ $booking->phone ?? '-' }}
- Utasok száma: {{ $booking->passenger_count ?? '-' }}

@if ($booking->message)
## Megjegyzés

{{ $booking->message }}
@endif

<x-mail::button :url="config('app.admin_url', config('app.url')) . '/bookings/tour-bookings/' . $booking->id">
Foglalás megnyitása az adminban
</x-mail::button>

Foglalás azonosítója: #{{ $booking->id }}
</x-mail::message>
