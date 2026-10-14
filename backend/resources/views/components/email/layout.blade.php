@use('App\Support\Mail\EmailCompany')
@use('App\Support\Mail\EmailStyle')
{{--
    The frame of every email we send, in the booking confirmation's design:
    gradient header with the logo on a white card, light body, company footer.
--}}
@props([
    'title',
    'eyebrow',
    'heading',
    'subheading' => null,
    'preheader' => null,
    'company' => null,
])
@php
    $company ??= EmailCompany::resolve();
    $font = EmailStyle::FONT;
@endphp
<!DOCTYPE html>
<html lang="hu">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>{{ $title }}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;">
@if ($preheader)
    <div style="display:none;max-height:0;overflow:hidden;">{{ $preheader }}</div>
@endif
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;">

    {{-- Header --}}
    <tr><td style="background:#0f172a;background-image:linear-gradient(135deg,#00c389 0%,#16b8ff 100%);border-radius:20px 20px 0 0;padding:32px 32px 28px;">
        @if ($company['logoUrl'])
            {{-- On a white card, as in the site header, so the logo keeps its colours on the gradient. --}}
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;"><tr>
                <td style="background:#ffffff;border-radius:16px;padding:10px 14px;box-shadow:0 10px 30px rgba(15,23,42,0.12);">
                    <img src="{{ $company['logoUrl'] }}" alt="{{ $company['name'] }}" height="40" style="display:block;height:40px;width:auto;border:0;">
                </td>
            </tr></table>
        @else
            <div style="{{ $font }}color:#ffffff;font-size:20px;font-weight:800;margin-bottom:24px;">{{ $company['name'] }}</div>
        @endif
        <div style="{{ $font }}color:#ffffff;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;opacity:0.9;">{{ $eyebrow }}</div>
        <div style="{{ $font }}color:#ffffff;font-size:26px;font-weight:800;line-height:1.25;margin-top:6px;">{{ $heading }}</div>
        @if ($subheading)
            <div style="{{ $font }}color:#ffffff;font-size:14px;margin-top:10px;opacity:0.95;">{{ $subheading }}</div>
        @endif
    </td></tr>

    <tr><td style="background:#f8fafc;padding:28px 24px;border-radius:0 0 20px 20px;">

        {{ $slot }}

        {{-- Footer --}}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e2e8f0;">
            <tr><td style="{{ $font }}padding:20px 0 0;color:#64748b;font-size:13px;line-height:1.7;">
                <strong style="color:#0f172a;">{{ $company['name'] }}</strong><br>
                {{ $company['address'] }}<br>
                @if ($company['phones'] !== [])
                    Tel.: {{ implode(' · ', $company['phones']) }}<br>
                @endif
                E-mail: <a href="mailto:{{ $company['email'] }}" style="color:#0891b2;text-decoration:none;">{{ $company['email'] }}</a><br>
                <a href="{{ $company['website'] }}" style="color:#0891b2;text-decoration:none;">{{ $company['websiteLabel'] }}</a>
                @if ($company['license'] !== '')
                    <br>{{ $company['license'] }}
                @endif
                <br><span style="color:#00a878;font-weight:700;">23 éve az UTAZÓK szolgálatában!</span>
            </td></tr>
        </table>

    </td></tr>
</table>
</td></tr>
</table>
</body>
</html>
