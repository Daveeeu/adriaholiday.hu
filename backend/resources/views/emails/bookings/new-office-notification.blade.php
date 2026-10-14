@use('App\Support\Mail\EmailStyle')
<x-email.layout
    :title="'Új foglalás – '.$tour->name"
    :preheader="'Új foglalás érkezett: '.$tour->name.' ('.($booking->customer_name ?? '-').')'"
    eyebrow="Új foglalás érkezett"
    :heading="$tour->name"
    :subheading="'Foglalás azonosítója: #'.$booking->id.($booking->departure_date ? ' · Indulás: '.$booking->departure_date->format('Y.m.d.') : '')"
>
    <x-email.button :url="$adminUrl">Foglalás megnyitása az adminban</x-email.button>

    <x-email.card title="👤 Kapcsolattartó">
        <x-email.rows :rows="[
            ['label' => 'Név', 'value' => $booking->customer_name ?? '-'],
            ['label' => 'E-mail', 'value' => $booking->email ?? '-'],
            ['label' => 'Telefon', 'value' => $booking->phone ?? '-'],
            ['label' => 'Utasok száma', 'value' => $booking->passenger_count ?? '-'],
        ]" />
    </x-email.card>

    @if ($pricingLines !== [])
        <x-email.card title="💳 Árösszesítő">
            <x-email.lines :lines="$pricingLines" />
            @if ($pricingTotal !== null)
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
                    <td style="{{ EmailStyle::FONT }}padding:14px 12px 0 0;color:#0f172a;font-size:16px;font-weight:800;">Végösszeg</td>
                    <td align="right" style="{{ EmailStyle::FONT }}padding:14px 0 0;color:#00a878;font-size:20px;font-weight:800;white-space:nowrap;">{{ $pricingTotal }}</td>
                </tr></table>
            @endif
        </x-email.card>
    @endif

    @if ($passengerSelections !== [])
        <x-email.card title="👥 Utasok felárai, biztosításai">
            <x-email.lines :lines="$passengerSelections" />
        </x-email.card>
    @endif

    @if ($extras !== [])
        <x-email.card title="➕ Extra opciók">
            <x-email.rows :rows="$extras" />
        </x-email.card>
    @endif

    @if ($booking->message)
        <x-email.card title="💬 Megjegyzés">
            <p style="{{ EmailStyle::TEXT }}margin:0;white-space:pre-line;">{{ $booking->message }}</p>
        </x-email.card>
    @endif
</x-email.layout>
