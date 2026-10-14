@use('App\Support\Mail\EmailStyle')
{{-- The email's main action, as a brand gradient button. --}}
@props(['url'])
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;"><tr>
    <td style="background:#00c389;background-image:linear-gradient(135deg,#00c389 0%,#16b8ff 100%);border-radius:12px;">
        <a href="{{ $url }}" style="{{ EmailStyle::FONT }}display:inline-block;padding:13px 24px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">{{ $slot }}</a>
    </td>
</tr></table>
