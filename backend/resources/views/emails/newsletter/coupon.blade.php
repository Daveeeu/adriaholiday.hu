<x-mail::message>
# Köszönjük, hogy feliratkoztál!

Ezentúl elsőként értesülsz a last minute ajánlatokról és az exkluzív kedvezményekről.

Ajándékba az alábbi kupont küldjük, amit a következő foglalásodnál tudsz beváltani:

<x-mail::panel>
**{{ $coupon->code }}**<br>
Kedvezmény értéke: {{ number_format((float) $coupon->value, 0, ',', ' ') }} Ft
@if ($coupon->expires_at)
<br>Érvényes: {{ $coupon->expires_at->format('Y.m.d.') }}-ig
@endif
</x-mail::panel>

Üdvözlettel,<br>
{{ config('app.name') }}
</x-mail::message>
