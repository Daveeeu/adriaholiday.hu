@use('App\Support\Mail\EmailStyle')
{{-- A white, rounded section of an email; "highlighted" gives it the brand-green border. --}}
@props(['title' => null, 'highlighted' => false])
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="{{ EmailStyle::CARD }}{{ $highlighted ? 'border-color:#00c389;' : '' }}margin-bottom:16px;">
    <tr><td style="padding:20px 22px;">
        @if ($title)
            <p style="{{ EmailStyle::HEADING }}">{{ $title }}</p>
        @endif
        {{ $slot }}
    </td></tr>
</table>
