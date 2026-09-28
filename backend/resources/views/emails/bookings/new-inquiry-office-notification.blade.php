<x-mail::message>
# Új csoportos ajánlatkérés érkezett

**{{ $tour->name }}**

- Kívánt időszak: {{ $inquiry->arrival?->format('Y.m.d.') }} – {{ $inquiry->departure?->format('Y.m.d.') }}
- Utasok száma: {{ $inquiry->passenger_count }} fő

## Kapcsolattartó

- Név: {{ $inquiry->customer_name }}
- Email: {{ $inquiry->email }}
- Telefon: {{ $inquiry->phone ?? '-' }}
- Cím: {{ $address !== '' ? $address : '-' }}

@if ($inquiry->message)
## Üzenet

{{ $inquiry->message }}
@endif

<x-mail::button :url="config('app.admin_url', config('app.url')) . '/bookings/tour-inquiries'">
Ajánlatkérések megnyitása az adminban
</x-mail::button>

Ajánlatkérés azonosítója: #{{ $inquiry->id }}
</x-mail::message>
