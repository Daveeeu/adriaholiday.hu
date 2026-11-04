@use('App\Support\Mail\EmailStyle')
<x-email.layout
    :title="'Megérkeztek a hiányzó adatok – #'.$booking->id"
    :preheader="$booking->customer_name.' megadta a foglaláshoz hiányzó adatokat.'"
    eyebrow="Hiányzó adatok megérkeztek"
    :heading="(string) $booking->offer_name_snapshot"
    :subheading="'Foglalás azonosítója: #'.$booking->id"
>
    <p style="{{ EmailStyle::TEXT }}margin-bottom:24px;">{{ $booking->customer_name }} megadta a foglaláshoz utólag bekért adatokat. Az adatokat a foglalás adatlapján találod.</p>

    <x-email.card title="📝 Megadott adatok">
        @foreach ($given as $group)
            <p style="{{ EmailStyle::FONT }}margin:{{ $loop->first ? '0' : '14px' }} 0 4px;color:#0f172a;font-size:14px;font-weight:700;">{{ $group['title'] }}</p>
            <x-email.lines :lines="$group['fields']" />
        @endforeach
    </x-email.card>

    <x-email.button :url="$adminUrl">Foglalás megnyitása az adminban</x-email.button>
</x-email.layout>
