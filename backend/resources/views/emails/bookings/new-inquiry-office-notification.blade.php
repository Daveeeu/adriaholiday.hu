@use('App\Support\Mail\EmailStyle')
<x-email.layout
    :title="'Új csoportos ajánlatkérés – '.$tour->name"
    :preheader="'Új csoportos ajánlatkérés: '.$tour->name.', '.$inquiry->passenger_count.' fő'"
    eyebrow="Új csoportos ajánlatkérés"
    :heading="$tour->name"
    :subheading="'Ajánlatkérés azonosítója: #'.$inquiry->id"
>
    <x-email.button :url="$adminUrl">Ajánlatkérések megnyitása az adminban</x-email.button>

    <x-email.card title="📅 Az ajánlatkérés">
        <x-email.rows :rows="[
            ['label' => 'Kívánt időszak', 'value' => $inquiry->arrival?->format('Y.m.d.').' – '.$inquiry->departure?->format('Y.m.d.')],
            ['label' => 'Utasok száma', 'value' => $inquiry->passenger_count.' fő'],
        ]" />
    </x-email.card>

    <x-email.card title="👤 Kapcsolattartó">
        <x-email.rows :rows="[
            ['label' => 'Név', 'value' => $inquiry->customer_name],
            ['label' => 'E-mail', 'value' => $inquiry->email],
            ['label' => 'Telefon', 'value' => $inquiry->phone ?? '-'],
            ['label' => 'Cím', 'value' => $address !== '' ? $address : '-'],
        ]" />
    </x-email.card>

    @if ($inquiry->message)
        <x-email.card title="💬 Üzenet">
            <p style="{{ EmailStyle::TEXT }}margin:0;white-space:pre-line;">{{ $inquiry->message }}</p>
        </x-email.card>
    @endif
</x-email.layout>
