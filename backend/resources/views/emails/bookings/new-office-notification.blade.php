{{--
    The office's copy of a booking, printed on paper: plain, small type and
    tables instead of cards, so a booking of two or three passengers fits on
    one A4 page.
--}}
@php
    $font = "font-family:Arial,Helvetica,sans-serif;";
    $cell = $font.'padding:3px 6px;border:1px solid #cbd5e1;font-size:11px;color:#0f172a;vertical-align:top;';
    $head = $cell.'background:#f1f5f9;font-weight:bold;text-align:left;';
    $label = $font.'padding:2px 8px 2px 0;font-size:11px;color:#475569;vertical-align:top;white-space:nowrap;';
    $value = $font.'padding:2px 0;font-size:11px;color:#0f172a;font-weight:bold;vertical-align:top;';
    $section = $font.'margin:12px 0 4px;font-size:12px;font-weight:bold;color:#0f172a;text-transform:uppercase;letter-spacing:0.5px;';
@endphp
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Új foglalás: {{ $tripName }}</title>
    <style>
        @page { margin: 12mm; }
    </style>
</head>
<body style="margin:0;padding:16px;background:#ffffff;">
<div style="max-width:760px;">

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style="{{ $font }}font-size:16px;font-weight:bold;color:#0f172a;">Új foglalás #{{ $booking->id }}: {{ $tripName }}</td>
            <td align="right" style="{{ $font }}font-size:11px;color:#475569;white-space:nowrap;">
                Beérkezett: {{ $booking->created_at?->timezone('Europe/Budapest')->format('Y.m.d. H:i') }}<br>
                <a href="{{ $adminUrl }}" style="color:#0369a1;">Megnyitás az adminban</a>
            </td>
        </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
        <tr>
            <td width="50%" style="vertical-align:top;padding-right:12px;">
                <p style="{{ $section }}">Utazás</p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                    @foreach ($tripRows as $row)
                        <tr><td style="{{ $label }}">{{ $row['label'] }}</td><td style="{{ $value }}">{{ $row['value'] }}</td></tr>
                    @endforeach
                </table>
            </td>
            <td width="50%" style="vertical-align:top;">
                <p style="{{ $section }}">Megrendelő</p>
                <table role="presentation" cellpadding="0" cellspacing="0">
                    @foreach ($contactRows as $row)
                        <tr><td style="{{ $label }}">{{ $row['label'] }}</td><td style="{{ $value }}">{{ $row['value'] }}</td></tr>
                    @endforeach
                </table>
            </td>
        </tr>
    </table>

    @if ($passengerTable['rows'] !== [])
        <p style="{{ $section }}">Utasok ({{ count($passengerTable['rows']) }} fő)</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
                <th style="{{ $head }}">#</th>
                @foreach ($passengerTable['columns'] as $column)
                    <th style="{{ $head }}">{{ $column }}</th>
                @endforeach
            </tr>
            @foreach ($passengerTable['rows'] as $index => $passenger)
                <tr>
                    <td style="{{ $cell }}">{{ $index + 1 }}.</td>
                    @foreach ($passengerTable['columns'] as $column)
                        <td style="{{ $cell }}">{{ $passenger[$column] ?? '' }}</td>
                    @endforeach
                </tr>
            @endforeach
        </table>
    @endif

    @if ($priceRows !== [])
        <p style="{{ $section }}">Ár</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            @foreach ($priceRows as $row)
                <tr>
                    <td style="{{ $cell }}">{{ $row['label'] }}</td>
                    <td align="right" style="{{ $cell }}white-space:nowrap;">{{ $row['amount'] }}</td>
                </tr>
            @endforeach
            @if ($total)
                <tr>
                    <td style="{{ $cell }}font-weight:bold;">Végösszeg</td>
                    <td align="right" style="{{ $cell }}font-weight:bold;white-space:nowrap;">{{ $total }}</td>
                </tr>
            @endif
        </table>
    @endif

    @if ($paymentSchedule !== [])
        <p style="{{ $section }}">Fizetés</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            @foreach ($paymentSchedule as $instalment)
                <tr>
                    <td style="{{ $cell }}">{{ $instalment['title'] }} ({{ $instalment['detail'] }})</td>
                    <td style="{{ $cell }}white-space:nowrap;">{{ $instalment['dueDate'] }}</td>
                    <td align="right" style="{{ $cell }}white-space:nowrap;">{{ $instalment['amount'] }}</td>
                </tr>
            @endforeach
        </table>
    @endif

    @if ($insuranceNames === [])
        <p style="{{ $font }}margin:8px 0 0;font-size:11px;font-weight:bold;color:#b45309;">Az utas/utasok biztosítást nem rendelt(ek).</p>
    @endif

    @php
        $optionRows = [...($paymentMethod ? [['label' => 'Fizetési mód', 'value' => $paymentMethod]] : []), ...$extraRows];
    @endphp
    @if ($optionRows !== [])
        <p style="{{ $section }}">Extra opciók</p>
        <table role="presentation" cellpadding="0" cellspacing="0">
            @foreach ($optionRows as $row)
                <tr><td style="{{ $label }}">{{ $row['label'] }}</td><td style="{{ $value }}">{{ $row['value'] }}</td></tr>
            @endforeach
        </table>
    @endif

    @if ($note)
        <p style="{{ $section }}">Megjegyzés</p>
        <p style="{{ $font }}margin:0;font-size:11px;color:#0f172a;white-space:pre-line;">{{ $note }}</p>
    @endif

</div>
</body>
</html>
