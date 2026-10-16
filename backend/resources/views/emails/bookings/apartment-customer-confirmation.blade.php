@use('App\Support\Mail\EmailStyle')
<x-email.layout
    :title="'Megkaptuk az apartmanfoglalásodat – '.$apartmentName"
    :preheader="'Megkaptuk a foglalásodat: '.$apartmentName.'. Kollégáink hamarosan visszaigazolják.'"
    eyebrow="Apartmanfoglalás"
    :heading="$apartmentName"
    :company="$company"
>
    <x-slot:subheading>Foglalási azonosító: <strong>#{{ $booking->id }}</strong></x-slot:subheading>

    <p style="{{ EmailStyle::GREETING }}">Kedves {{ $customerName }}!</p>
    <p style="{{ EmailStyle::TEXT }}margin-bottom:24px;">Köszönjük a foglalásodat, megérkezett hozzánk. Kollégáink ellenőrzik az apartman szabad helyét, és e-mailben visszaigazolják a foglalást, a fizetés részleteivel és az előlegszámlával együtt. Az utazási szerződés az előleg beérkezésével jön létre.</p>

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

    <x-email.sign-off :company="$company" />
</x-email.layout>
