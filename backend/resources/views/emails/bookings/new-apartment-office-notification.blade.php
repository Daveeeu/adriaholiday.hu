@use('App\Support\Mail\EmailStyle')
<x-email.layout
    :title="'Új apartmanfoglalás – '.$apartmentName"
    :preheader="'Új apartmanfoglalás: '.$apartmentName.', '.$booking->passenger_count.' fő'"
    eyebrow="Új apartmanfoglalás"
    :heading="$apartmentName"
    :subheading="'Foglalás azonosítója: #'.$booking->id"
>
    <x-email.button :url="$adminUrl">Apartmanfoglalások megnyitása az adminban</x-email.button>

    <x-email.card title="🏖️ A foglalás">
        <x-email.rows :rows="$stayRows" />
    </x-email.card>

    <x-email.card title="👤 Megrendelő">
        <x-email.rows :rows="$contactRows" />
    </x-email.card>

    @if ($passengers !== [])
        <x-email.card title="👥 Utasok">
            @foreach ($passengers as $index => $passengerRows)
                <p style="{{ EmailStyle::TEXT }}margin:{{ $index === 0 ? '0' : '14px' }} 0 6px;font-weight:700;">{{ $index + 1 }}. utas</p>
                <x-email.rows :rows="$passengerRows" />
            @endforeach
        </x-email.card>
    @endif

    @if ($note)
        <x-email.card title="💬 Egyéb kérés, közlendő">
            <p style="{{ EmailStyle::TEXT }}margin:0;white-space:pre-line;">{{ $note }}</p>
        </x-email.card>
    @endif
</x-email.layout>
