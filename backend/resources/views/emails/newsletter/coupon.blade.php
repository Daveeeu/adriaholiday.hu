@use('App\Support\Mail\EmailStyle')
<x-email.layout
    title="Köszönjük a feliratkozást!"
    preheader="Ajándékba küldjük a kuponodat, amit a következő foglalásodnál válthatsz be."
    eyebrow="Hírlevél"
    heading="Köszönjük, hogy feliratkoztál!"
    :company="$company"
>
    <p style="{{ EmailStyle::TEXT }}">Ezentúl elsőként értesülsz a last minute ajánlatokról és az exkluzív kedvezményekről.</p>
    <p style="{{ EmailStyle::TEXT }}margin-bottom:24px;">Ajándékba az alábbi kupont küldjük, amit a következő foglalásodnál tudsz beváltani:</p>

    <x-email.card highlighted>
        <p style="{{ EmailStyle::FONT }}margin:0 0 6px;color:#64748b;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">🎁 Kuponkód</p>
        <p style="{{ EmailStyle::FONT }}margin:0 0 16px;color:#0f172a;font-size:28px;font-weight:800;letter-spacing:2px;">{{ $coupon->code }}</p>
        <x-email.rows :rows="array_filter([
            ['label' => 'Kedvezmény értéke', 'value' => number_format((float) $coupon->value, 0, ',', ' ').' Ft'],
            $coupon->expires_at ? ['label' => 'Érvényes', 'value' => $coupon->expires_at->format('Y.m.d.').'-ig'] : null,
        ])" />
    </x-email.card>

    <p style="{{ EmailStyle::MUTED }}margin-bottom:20px;">A kuponkódot a foglalási űrlap utolsó lépésében add meg; utólag sajnos nem tudjuk érvényesíteni.</p>

    <x-email.button :url="$tripsUrl">Utazások böngészése</x-email.button>

    <x-email.sign-off :company="$company" />
</x-email.layout>
