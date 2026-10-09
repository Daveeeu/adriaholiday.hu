<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="utf-8">
    <title>Foglalás {{ $booking->offer_code ?: '#'.$booking->id }}</title>
    <style>
        @page { margin: 0 0 60px 0; }
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10.5px; color: #0f172a; margin: 0; }
        .header { background: #071321; color: #fff; padding: 26px 40px 22px; }
        .header-accent { height: 5px; background: #00c389; }
        .logo-wrap { display: inline-block; background: #fff; border-radius: 8px; padding: 6px 10px; margin-bottom: 14px; }
        .logo { height: 30px; }
        .eyebrow { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: #5eead4; font-weight: bold; }
        .title { font-size: 20px; font-weight: bold; margin: 4px 0 6px; }
        .meta { font-size: 10px; color: #cbd5e1; }
        .status { display: inline-block; padding: 3px 10px; border-radius: 10px; background: #00c389; color: #fff; font-size: 9.5px; font-weight: bold; }
        .content { padding: 22px 40px 0; }
        .section { margin-bottom: 16px; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; }
        .section-title { font-size: 12.5px; font-weight: bold; color: #0f172a; margin: 0 0 8px; padding-bottom: 6px; border-bottom: 2px solid #00c389; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 3px 0; vertical-align: top; }
        td.label { color: #64748b; width: 38%; }
        td.value { font-weight: bold; }
        td.amount { text-align: right; font-weight: bold; white-space: nowrap; }
        tr.line td { border-bottom: 1px solid #f1f5f9; padding: 5px 0; }
        tr.total td { padding-top: 9px; font-size: 13px; font-weight: bold; }
        tr.total td.amount { color: #00a878; }
        .passenger { font-size: 9.5px; font-weight: bold; color: #00a878; margin: 8px 0 2px; }
        .warning { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; border-radius: 10px; padding: 9px 14px; font-weight: bold; margin-bottom: 16px; }
        .insured { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; border-radius: 10px; padding: 9px 14px; margin-bottom: 16px; }
        .note { white-space: pre-line; color: #334155; }
        .two-col td.col { width: 50%; vertical-align: top; }
        .footer { position: fixed; bottom: -60px; left: 0; right: 0; height: 60px; background: #071321; color: #94a3b8; font-size: 8.5px; padding: 14px 40px 0; }
        .footer strong { color: #fff; }
    </style>
</head>
<body>
    <div class="footer">
        <strong>{{ $company['name'] }}</strong> · {{ $company['address'] }} · {{ $company['email'] }}
        @if ($company['license'] !== '')
            · {{ $company['license'] }}
        @endif
        @if ($company['phones'] !== [])
            <br>Tel.: {{ implode(' · ', $company['phones']) }}
        @endif
        <br>Készült: {{ $generatedAt }}
    </div>

    <div class="header">
        @if ($branding['logoDataUri'])
            <div class="logo-wrap"><img class="logo" src="{{ $branding['logoDataUri'] }}" alt="{{ $company['name'] }}"></div>
        @endif
        <div class="eyebrow">Foglalás</div>
        <div class="title">{{ $tripName }}</div>
        <div class="meta">
            {{ $booking->offer_code ?: '#'.$booking->id }}
            · Foglalva: {{ ($booking->booking_date ?? $booking->created_at)?->format('Y.m.d. H:i') }}
            &nbsp; <span class="status">{{ $statusLabel }}</span>
        </div>
    </div>
    <div class="header-accent"></div>

    <div class="content">
        <table class="two-col"><tr>
            <td class="col" style="padding-right: 8px;">
                <div class="section">
                    <p class="section-title">Az utazás</p>
                    <table>
                        @foreach ($tripRows as $row)
                            <tr><td class="label">{{ $row['label'] }}</td><td class="value">{{ $row['value'] }}</td></tr>
                        @endforeach
                    </table>
                </div>
            </td>
            <td class="col" style="padding-left: 8px;">
                <div class="section">
                    <p class="section-title">Megrendelő</p>
                    <table>
                        @forelse ($contactRows as $row)
                            <tr><td class="label">{{ $row['label'] }}</td><td class="value">{{ $row['value'] }}</td></tr>
                        @empty
                            <tr><td class="label">Név</td><td class="value">{{ $customerName }}</td></tr>
                        @endforelse
                    </table>
                </div>
            </td>
        </tr></table>

        @if ($passengers !== [])
            <div class="section">
                <p class="section-title">Utasok ({{ count($passengers) }} fő)</p>
                @foreach ($passengers as $index => $passengerRows)
                    <div class="passenger">{{ $index + 1 }}. utas</div>
                    <table>
                        @foreach ($passengerRows as $row)
                            <tr><td class="label">{{ $row['label'] }}</td><td class="value">{{ $row['value'] }}</td></tr>
                        @endforeach
                    </table>
                @endforeach
            </div>
        @endif

        @if ($priceRows !== [] || $extraRows !== [] || $total)
            <div class="section">
                <p class="section-title">Részvételi díj</p>
                <table>
                    @foreach ($priceRows as $row)
                        <tr class="line"><td>{{ $row['label'] }}</td><td class="amount">{{ $row['amount'] }}</td></tr>
                    @endforeach
                    @foreach ($extraRows as $row)
                        <tr class="line"><td>{{ $row['label'] }}</td><td class="amount">{{ $row['value'] }}</td></tr>
                    @endforeach
                    @if ($total)
                        <tr class="total"><td>Utazás teljes összege</td><td class="amount">{{ $total }}</td></tr>
                    @endif
                </table>
            </div>
        @endif

        @if ($insuranceNames === [])
            <div class="warning">Az utas/utasok a foglaláshoz biztosítást nem rendelt(ek).</div>
        @else
            <div class="insured">Megrendelt biztosítás: <strong>{{ implode(', ', $insuranceNames) }}</strong></div>
        @endif

        @if ($paymentMethod || $bankTransfer)
            <div class="section">
                <p class="section-title">Fizetés</p>
                <table>
                    @if ($paymentMethod)
                        <tr><td class="label">Fizetési mód</td><td class="value">{{ $paymentMethod }}</td></tr>
                    @endif
                    @if ($bankTransfer)
                        <tr><td class="label">Fizetendő</td><td class="value">{{ $bankTransfer['amount'] }}</td></tr>
                        <tr><td class="label">Fizetési határidő</td><td class="value">{{ $bankTransfer['dueDate'] }}</td></tr>
                        <tr><td class="label">Számlaszám</td><td class="value">{{ $bankTransfer['accountNumber'] }}</td></tr>
                        @if ($bankTransfer['accountHolder'] !== '')
                            <tr><td class="label">Számlatulajdonos</td><td class="value">{{ $bankTransfer['accountHolder'] }}</td></tr>
                        @endif
                    @endif
                </table>
            </div>
        @endif

        @if ($note || $booking->admin_note)
            <div class="section">
                <p class="section-title">Megjegyzések</p>
                @if ($note)
                    <p class="label" style="margin: 0 0 2px; color: #64748b;">Az utas megjegyzése</p>
                    <p class="note" style="margin: 0 0 8px;">{{ $note }}</p>
                @endif
                @if ($booking->admin_note)
                    <p style="margin: 0 0 2px; color: #64748b;">Belső megjegyzés</p>
                    <p class="note" style="margin: 0;">{{ $booking->admin_note }}</p>
                @endif
            </div>
        @endif
    </div>
</body>
</html>
