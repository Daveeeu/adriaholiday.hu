<x-mail::message>
# Új üzenet érkezett a weboldalról

- Név: {{ $contactMessage->name }}
- E-mail: {{ $contactMessage->email }}
- Telefon: {{ $contactMessage->phone ?? '-' }}

## Üzenet

{{ $contactMessage->message }}

<x-mail::button :url="config('app.admin_url', config('app.url')) . '/bookings/messages'">
Üzenetek megnyitása az adminban
</x-mail::button>

Válaszolni erre a levélre közvetlenül az üzenet küldőjének lehet.
</x-mail::message>
