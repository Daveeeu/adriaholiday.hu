@use('App\Support\Mail\EmailStyle')
{{-- Label – value pairs, e.g. the trip's details or the customer's contact data. --}}
@props(['rows'])
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    @foreach ($rows as $row)
        <tr><td style="{{ EmailStyle::LABEL }}">{{ $row['label'] }}</td><td style="{{ EmailStyle::VALUE }}">{{ $row['value'] }}</td></tr>
    @endforeach
</table>
