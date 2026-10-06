@php
    $font = "font-family:'Segoe UI',Helvetica,Arial,sans-serif;";
    $label = $font.'padding:6px 12px 6px 0;color:#64748b;font-size:14px;vertical-align:top;width:42%;';
    $value = $font.'padding:6px 0;color:#0f172a;font-size:14px;font-weight:600;vertical-align:top;';
    $heading = $font.'margin:0 0 12px;color:#0f172a;font-size:17px;font-weight:700;';
    $card = 'background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;';
@endphp
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>Foglalás visszaigazolás – {{ $tour->name }}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;">
<div style="display:none;max-height:0;overflow:hidden;">
    Foglalásod rögzítettük: {{ $tour->name }}. Itt találod az utazás és a fizetés minden részletét.
</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;">

    {{-- Header --}}
    <tr><td style="background:#0f172a;background-image:linear-gradient(135deg,#00c389 0%,#16b8ff 100%);border-radius:20px 20px 0 0;padding:32px 32px 28px;">
        @if ($company['logoUrl'])
            <img src="{{ $company['logoUrl'] }}" alt="{{ $company['name'] }}" height="44" style="display:block;height:44px;width:auto;border:0;margin-bottom:24px;">
        @else
            <div style="{{ $font }}color:#ffffff;font-size:20px;font-weight:800;margin-bottom:24px;">{{ $company['name'] }}</div>
        @endif
        <div style="{{ $font }}color:#ffffff;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;opacity:0.9;">Foglalás visszaigazolás</div>
        <div style="{{ $font }}color:#ffffff;font-size:26px;font-weight:800;line-height:1.25;margin-top:6px;">{{ $tour->name }}</div>
        <div style="{{ $font }}color:#ffffff;font-size:14px;margin-top:10px;opacity:0.95;">Foglalási azonosító: <strong>#{{ $booking->id }}</strong></div>
    </td></tr>

    <tr><td style="background:#f8fafc;padding:28px 24px;border-radius:0 0 20px 20px;">

        {{-- Greeting --}}
        <p style="{{ $font }}margin:0 0 8px;color:#0f172a;font-size:16px;">Kedves {{ $customerName }}!</p>
        <p style="{{ $font }}margin:0 0 24px;color:#334155;font-size:15px;line-height:1.6;">Köszönjük foglalását, melyet ezúton visszaigazolunk. Alább megtalálja utazása és a fizetés minden részletét.</p>

        {{-- Trip --}}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="{{ $card }}margin-bottom:16px;">
            <tr><td style="padding:20px 22px;">
                <p style="{{ $heading }}">🧳 Az utazás</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    @foreach ($tripRows as $row)
                        <tr><td style="{{ $label }}">{{ $row['label'] }}</td><td style="{{ $value }}">{{ $row['value'] }}</td></tr>
                    @endforeach
                </table>
            </td></tr>
        </table>

        {{-- Contact --}}
        @if ($contactRows !== [] || $note)
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="{{ $card }}margin-bottom:16px;">
                <tr><td style="padding:20px 22px;">
                    <p style="{{ $heading }}">👤 Megrendelő</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        @foreach ($contactRows as $row)
                            <tr><td style="{{ $label }}">{{ $row['label'] }}</td><td style="{{ $value }}">{{ $row['value'] }}</td></tr>
                        @endforeach
                        @if ($note)
                            <tr><td style="{{ $label }}">Megjegyzés</td><td style="{{ $value }}">{{ $note }}</td></tr>
                        @endif
                    </table>
                </td></tr>
            </table>
        @endif

        {{-- Passengers --}}
        @if ($passengers !== [])
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="{{ $card }}margin-bottom:16px;">
                <tr><td style="padding:20px 22px;">
                    <p style="{{ $heading }}">👥 Utasok</p>
                    @foreach ($passengers as $index => $passengerRows)
                        <div style="{{ $font }}display:inline-block;background:#e6faf3;color:#00a878;font-size:12px;font-weight:700;border-radius:999px;padding:3px 10px;margin:{{ $index === 0 ? '0' : '14px' }} 0 6px;">{{ $index + 1 }}. utas</div>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            @foreach ($passengerRows as $row)
                                <tr><td style="{{ $label }}">{{ $row['label'] }}</td><td style="{{ $value }}">{{ $row['value'] }}</td></tr>
                            @endforeach
                        </table>
                    @endforeach
                </td></tr>
            </table>
        @endif

        {{-- Price --}}
        @if ($priceRows !== [] || $extraRows !== [])
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="{{ $card }}margin-bottom:16px;">
                <tr><td style="padding:20px 22px;">
                    <p style="{{ $heading }}">💳 Részvételi díj</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        @foreach ($priceRows as $row)
                            <tr>
                                <td style="{{ $font }}padding:7px 12px 7px 0;color:#334155;font-size:14px;border-bottom:1px solid #f1f5f9;">{{ $row['label'] }}</td>
                                <td align="right" style="{{ $font }}padding:7px 0;color:#0f172a;font-size:14px;font-weight:600;white-space:nowrap;border-bottom:1px solid #f1f5f9;">{{ $row['amount'] }}</td>
                            </tr>
                        @endforeach
                        @foreach ($extraRows as $row)
                            <tr>
                                <td style="{{ $font }}padding:7px 12px 7px 0;color:#334155;font-size:14px;border-bottom:1px solid #f1f5f9;">{{ $row['label'] }}</td>
                                <td align="right" style="{{ $font }}padding:7px 0;color:#0f172a;font-size:14px;font-weight:600;border-bottom:1px solid #f1f5f9;">{{ $row['value'] }}</td>
                            </tr>
                        @endforeach
                        @if ($total)
                            <tr>
                                <td style="{{ $font }}padding:14px 12px 0 0;color:#0f172a;font-size:16px;font-weight:800;">Utazás teljes összege</td>
                                <td align="right" style="{{ $font }}padding:14px 0 0;color:#00a878;font-size:20px;font-weight:800;white-space:nowrap;">{{ $total }}</td>
                            </tr>
                        @endif
                    </table>
                </td></tr>
            </table>
        @endif

        {{-- Insurance --}}
        @if ($insuranceNames === [])
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;margin-bottom:16px;">
                <tr><td style="{{ $font }}padding:16px 22px;color:#9a3412;font-size:14px;font-weight:700;line-height:1.5;">
                    ⚠️ Az utas/utasok a foglaláshoz biztosítást nem rendelt(ek).
                </td></tr>
            </table>
        @else
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:16px;margin-bottom:16px;">
                <tr><td style="{{ $font }}padding:16px 22px;color:#065f46;font-size:14px;line-height:1.5;">
                    🛡️ Megrendelt biztosítás: <strong>{{ implode(', ', $insuranceNames) }}</strong>
                </td></tr>
            </table>
        @endif

        {{-- Payment --}}
        @if ($bankTransfer || $paymentMethod)
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="{{ $card }}border-color:#00c389;margin-bottom:16px;">
                <tr><td style="padding:20px 22px;">
                    <p style="{{ $heading }}">🏦 Fizetés</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        @if ($paymentMethod)
                            <tr><td style="{{ $label }}">Fizetési mód</td><td style="{{ $value }}">{{ $paymentMethod }}</td></tr>
                        @endif
                        @if ($bankTransfer)
                            <tr><td style="{{ $label }}">Fizetendő</td><td style="{{ $value }}">{{ $bankTransfer['amount'] }}</td></tr>
                            <tr><td style="{{ $label }}">Fizetési határidő</td><td style="{{ $value }}">{{ $bankTransfer['dueDate'] }}</td></tr>
                            <tr><td style="{{ $label }}">Számlaszám</td><td style="{{ $value }}">{{ $bankTransfer['accountNumber'] }}</td></tr>
                            @if ($bankTransfer['accountHolder'] !== '')
                                <tr><td style="{{ $label }}">Számlatulajdonos</td><td style="{{ $value }}">{{ $bankTransfer['accountHolder'] }}</td></tr>
                            @endif
                        @endif
                    </table>
                    @if ($bankTransfer)
                        <p style="{{ $font }}margin:14px 0 0;padding:12px 14px;background:#f8fafc;border-radius:12px;color:#334155;font-size:13px;line-height:1.6;">
                            Kérjük, az átutalás közlemény rovatában tüntesse fel a megrendelő nevét, az utazás pontos nevét és az indulás dátumát.
                            Az utazási szerződést és a számlát az előleg beérkezését követően küldjük.
                        </p>
                    @endif
                </td></tr>
            </table>
        @endif

        {{-- Entry requirements & terms --}}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="{{ $card }}margin-bottom:24px;">
            <tr><td style="padding:20px 22px;">
                <p style="{{ $heading }}">📋 Fontos tudnivalók</p>
                @if ($entryRequirementLinks !== [])
                    <p style="{{ $font }}margin:0 0 6px;color:#334155;font-size:14px;line-height:1.6;">Aktuális beutazási feltételek:</p>
                    @foreach ($entryRequirementLinks as $link)
                        <p style="{{ $font }}margin:0 0 4px;font-size:14px;"><a href="{{ $link['url'] }}" style="color:#0891b2;font-weight:600;text-decoration:none;">{{ $link['country'] }} →</a></p>
                    @endforeach
                    <p style="{{ $font }}margin:8px 0 14px;color:#64748b;font-size:13px;line-height:1.6;">Kérjük, kövesse figyelemmel a fenti linket az aktuális szabályok ismerete végett. A célország beutazási és egészségügyi feltételeinek ismerete és a feltételek megléte az utazók felelőssége.</p>
                @endif
                <p style="{{ $font }}margin:0;font-size:14px;"><a href="{{ $termsUrl }}" style="color:#0891b2;font-weight:600;text-decoration:none;">Általános Szerződési Feltételek →</a></p>
            </td></tr>
        </table>

        <p style="{{ $font }}margin:0 0 4px;color:#334155;font-size:15px;">Kérdés esetén állunk rendelkezésére.</p>
        <p style="{{ $font }}margin:0 0 28px;color:#334155;font-size:15px;">Üdvözlettel:<br><strong style="color:#0f172a;">{{ $company['name'] }}</strong></p>

        {{-- Footer --}}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;">
            <tr><td style="{{ $font }}padding:20px 0 0;color:#64748b;font-size:13px;line-height:1.7;">
                <strong style="color:#0f172a;">{{ $company['name'] }}</strong><br>
                {{ $company['address'] }}<br>
                Tel.: {{ $company['phone'] }} · <a href="mailto:{{ $company['email'] }}" style="color:#0891b2;text-decoration:none;">{{ $company['email'] }}</a><br>
                <a href="{{ $company['website'] }}" style="color:#0891b2;text-decoration:none;">{{ $company['websiteLabel'] }}</a>
                @if ($company['license'] !== '')
                    <br>{{ $company['license'] }}
                @endif
                <br><span style="color:#00a878;font-weight:700;">20 éve az UTAZÓK szolgálatában!</span>
            </td></tr>
        </table>

    </td></tr>
</table>
</td></tr>
</table>
</body>
</html>
