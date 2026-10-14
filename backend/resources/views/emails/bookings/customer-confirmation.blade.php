@use('App\Support\Mail\EmailStyle')
@php
    $font = EmailStyle::FONT;
    $label = EmailStyle::LABEL;
    $value = EmailStyle::VALUE;
@endphp
<x-email.layout
    :title="'Foglalás visszaigazolás – '.$tripName"
    :preheader="'Foglalásod rögzítettük: '.$tripName.'. Itt találod az utazás és a fizetés minden részletét.'"
    eyebrow="Foglalás visszaigazolás"
    :heading="$tripName"
    :company="$company"
>
    <x-slot:subheading>Foglalási azonosító: <strong>#{{ $booking->id }}</strong></x-slot:subheading>

        {{-- Greeting --}}
        <p style="{{ EmailStyle::GREETING }}">Kedves {{ $customerName }}!</p>
        <p style="{{ EmailStyle::TEXT }}margin-bottom:24px;">Köszönjük a foglalásodat, ezúton visszaigazoljuk. Alább megtalálod az utazás és a fizetés minden részletét, a csatolt <strong>utazási könyvben</strong> pedig mindezt a programmal együtt, utasonként a választott felárakkal és biztosításokkal.</p>

        {{-- Trip --}}
        <x-email.card title="🧳 Az utazás">
            <x-email.rows :rows="$tripRows" />
        </x-email.card>

        {{-- Contact --}}
        @if ($contactRows !== [] || $note)
            <x-email.card title="👤 Megrendelő">
                <x-email.rows :rows="$note ? [...$contactRows, ['label' => 'Megjegyzés', 'value' => $note]] : $contactRows" />
            </x-email.card>
        @endif

        {{-- Passengers --}}
        @if ($passengers !== [])
            <x-email.card title="👥 Utasok">
                @foreach ($passengers as $index => $passengerRows)
                    <div style="{{ $font }}display:inline-block;background:#e6faf3;color:#00a878;font-size:12px;font-weight:700;border-radius:999px;padding:3px 10px;margin:{{ $index === 0 ? '0' : '14px' }} 0 6px;">{{ $index + 1 }}. utas</div>
                    <x-email.rows :rows="$passengerRows" />
                @endforeach
            </x-email.card>
        @endif

        {{-- Price --}}
        @if ($priceRows !== [] || $extraRows !== [])
            <x-email.card title="💳 Részvételi díj">
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
            </x-email.card>
        @endif

        {{-- Insurance --}}
        @if ($insuranceNames === [])
            <x-email.notice tone="warning"><strong>⚠️ Az utas/utasok a foglaláshoz biztosítást nem rendelt(ek).</strong></x-email.notice>
        @else
            <x-email.notice>🛡️ Megrendelt biztosítás: <strong>{{ implode(', ', $insuranceNames) }}</strong></x-email.notice>
        @endif

        {{-- Payment --}}
        @if ($paymentSchedule !== [] || $bankTransfer || $paymentMethod)
            <x-email.card title="🏦 Fizetés" highlighted>
                    @if ($paymentSchedule !== [])
                        <p style="{{ $font }}margin:0 0 6px;color:#0f172a;font-size:14px;font-weight:700;">{{ count($paymentSchedule) > 1 ? 'Részletfizetés és fizetési határidők' : 'Fizetési határidő' }}</p>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                            @foreach ($paymentSchedule as $instalment)
                                <tr>
                                    <td style="{{ $font }}padding:9px 12px 9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;">
                                        <div style="color:#0f172a;font-size:14px;font-weight:700;">{{ $instalment['title'] }}</div>
                                        <div style="color:#64748b;font-size:13px;margin-top:2px;">{{ $instalment['detail'] }} · {{ $instalment['dueRule'] }}</div>
                                    </td>
                                    <td align="right" style="{{ $font }}padding:9px 0;border-bottom:1px solid #f1f5f9;vertical-align:top;white-space:nowrap;">
                                        <div style="color:#0f172a;font-size:15px;font-weight:800;">{{ $instalment['amount'] }}</div>
                                        <div style="color:#00a878;font-size:13px;font-weight:700;margin-top:2px;">{{ $instalment['dueDate'] }}</div>
                                    </td>
                                </tr>
                            @endforeach
                        </table>
                    @endif
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        @if ($paymentMethod)
                            <tr><td style="{{ $label }}">Fizetési mód</td><td style="{{ $value }}">{{ $paymentMethod }}</td></tr>
                        @endif
                        @if ($bankTransfer)
                            <tr><td style="{{ $label }}">Számlaszám</td><td style="{{ $value }}">{{ $bankTransfer['accountNumber'] }}</td></tr>
                            @if ($bankTransfer['accountHolder'] !== '')
                                <tr><td style="{{ $label }}">Számlatulajdonos</td><td style="{{ $value }}">{{ $bankTransfer['accountHolder'] }}</td></tr>
                            @endif
                        @endif
                    </table>
                    @if ($bankTransfer)
                        <p style="{{ $font }}margin:14px 0 0;padding:12px 14px;background:#f8fafc;border-radius:12px;color:#334155;font-size:13px;line-height:1.6;">
                            Kérjük, az átutalás közlemény rovatában tüntesd fel a megrendelő nevét, az utazás pontos nevét és az indulás dátumát.
                            Az utazási szerződést és a számlát az előleg beérkezését követően küldjük.
                        </p>
                    @endif
            </x-email.card>
        @endif

        {{-- Entry requirements & terms --}}
        <x-email.card title="📋 Fontos tudnivalók">
                <p style="{{ $font }}margin:0 0 14px;color:#0f172a;font-size:14px;font-weight:700;line-height:1.6;">Az utazással kapcsolatos részletes információkat az utazás előtt megkapod tőlünk.</p>
                @if ($entryRequirementLinks !== [])
                    <p style="{{ $font }}margin:0 0 6px;color:#334155;font-size:14px;line-height:1.6;">Aktuális beutazási feltételek:</p>
                    @foreach ($entryRequirementLinks as $link)
                        <p style="{{ $font }}margin:0 0 4px;font-size:14px;"><a href="{{ $link['url'] }}" style="color:#0891b2;font-weight:600;text-decoration:none;">{{ $link['country'] }} →</a></p>
                    @endforeach
                    <p style="{{ $font }}margin:8px 0 14px;color:#64748b;font-size:13px;line-height:1.6;">Kérjük, kövesd figyelemmel a fenti linket, hogy mindig ismerd az aktuális szabályokat. A célország beutazási és egészségügyi feltételeinek ismerete és a feltételek megléte az utazók felelőssége.</p>
                @endif
                <p style="{{ $font }}margin:0;font-size:14px;"><a href="{{ $termsUrl }}" style="{{ EmailStyle::LINK }}">Általános Szerződési Feltételek →</a></p>
        </x-email.card>

        <x-email.sign-off :company="$company" />

</x-email.layout>
