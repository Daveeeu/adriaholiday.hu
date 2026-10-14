@use('App\Support\Mail\EmailStyle')
{{-- One line of text per row, divided by hairlines, e.g. a price breakdown's lines. --}}
@props(['lines'])
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    @foreach ($lines as $line)
        <tr><td style="{{ EmailStyle::FONT }}padding:7px 0;color:#334155;font-size:14px;border-bottom:1px solid #f1f5f9;">{{ $line }}</td></tr>
    @endforeach
</table>
