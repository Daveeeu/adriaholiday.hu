@use('App\Support\Mail\EmailStyle')
<x-email.layout
    title="Meghívó az admin felületre"
    preheader="Állítsd be a jelszavadat, és már be is léphetsz."
    eyebrow="Admin felület"
    heading="Szia {{ $user->name }}!"
    :company="$company"
>
    <p style="{{ EmailStyle::TEXT }}">Fiókot hoztunk létre neked az Adria Holiday admin felületén. A belépéshez először állítsd be a jelszavadat:</p>

    <x-email.button :url="$acceptUrl">Jelszó beállítása</x-email.button>

    <x-email.card>
        <x-email.rows :rows="[
            ['label' => 'Belépési e-mail', 'value' => $user->email],
            ['label' => 'Admin felület', 'value' => $company['website'].'/admin'],
        ]" />
    </x-email.card>

    <p style="{{ EmailStyle::MUTED }}margin-bottom:20px;">A link {{ $validDays }} napig érvényes, és csak egyszer használható. Ha lejárt, kérj új meghívót az adminisztrátortól. Ha nem számítottál erre a levélre, nyugodtan hagyd figyelmen kívül.</p>

    <x-email.sign-off :company="$company" />
</x-email.layout>
