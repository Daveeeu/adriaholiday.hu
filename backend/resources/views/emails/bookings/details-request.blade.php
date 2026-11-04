@use('App\Support\Mail\EmailStyle')
<x-email.layout
    :title="'Hiányzó adatok a foglalásodhoz: '.$tripName"
    :preheader="'Néhány adat még hiányzik a foglalásodhoz: '.$tripName.'. Az alábbi linken tudod megadni.'"
    eyebrow="Hiányzó adatok"
    :heading="$tripName"
    :company="$company"
>

    <p style="{{ EmailStyle::GREETING }}">Kedves {{ $customerName }}!</p>
    <p style="{{ EmailStyle::TEXT }}margin-bottom:24px;">Köszönjük a foglalásodat! Az utazáshoz az alábbi adatokra is szükségünk van, amelyeket a foglaláskor még nem adtál meg. Kérjük, az alábbi gombra kattintva pótold őket.</p>

    <x-email.card title="📝 Hiányzó adatok">
        @foreach ($missing as $group)
            <p style="{{ EmailStyle::FONT }}margin:{{ $loop->first ? '0' : '14px' }} 0 4px;color:#0f172a;font-size:14px;font-weight:700;">{{ $group['title'] }}</p>
            <x-email.lines :lines="$group['fields']" />
        @endforeach
    </x-email.card>

    <x-email.button :url="$url">Adatok megadása</x-email.button>

    <p style="{{ EmailStyle::MUTED }}margin-bottom:20px;">A link csak a te foglalásodhoz tartozik, kérjük, ne add tovább. Ha a gomb nem működik, másold be ezt a címet a böngésződbe: {{ $url }}</p>

    <x-email.sign-off :company="$company" />
</x-email.layout>
