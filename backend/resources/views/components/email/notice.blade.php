@use('App\Support\Mail\EmailStyle')
{{-- A coloured note: "success" (green) for good news, "warning" (orange) for what needs attention. --}}
@props(['tone' => 'success'])
@php
    [$background, $border, $color] = $tone === 'warning'
        ? ['#fff7ed', '#fed7aa', '#9a3412']
        : ['#ecfdf5', '#a7f3d0', '#065f46'];
@endphp
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{{ $background }};border:1px solid {{ $border }};border-radius:16px;margin-bottom:16px;">
    <tr><td style="{{ EmailStyle::FONT }}padding:16px 22px;color:{{ $color }};font-size:14px;line-height:1.5;">
        {{ $slot }}
    </td></tr>
</table>
