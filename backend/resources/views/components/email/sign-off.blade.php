@use('App\Support\Mail\EmailStyle')
{{-- "Ha kérdésed van…" and the agency's signature, closing every customer email. --}}
@props(['company'])
<p style="{{ EmailStyle::TEXT }}margin:8px 0 4px;">Ha kérdésed van, szívesen segítünk.</p>
<p style="{{ EmailStyle::TEXT }}margin-bottom:28px;">Üdvözlettel:<br><strong style="color:#0f172a;">{{ $company['name'] }}</strong></p>
