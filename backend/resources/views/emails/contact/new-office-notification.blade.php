@use('App\Support\Mail\EmailStyle')
<x-email.layout
    :title="'Új üzenet a weboldalról – '.$contactMessage->name"
    :preheader="'Új üzenet érkezett a weboldalról: '.$contactMessage->name"
    eyebrow="Új üzenet a weboldalról"
    :heading="$contactMessage->name"
    subheading="Erre a levélre válaszolva közvetlenül az üzenet küldőjének írsz."
>
    <x-email.button :url="$adminUrl">Üzenetek megnyitása az adminban</x-email.button>

    <x-email.card title="👤 Feladó">
        <x-email.rows :rows="[
            ['label' => 'Név', 'value' => $contactMessage->name],
            ['label' => 'E-mail', 'value' => $contactMessage->email],
            ['label' => 'Telefon', 'value' => $contactMessage->phone ?? '-'],
        ]" />
    </x-email.card>

    <x-email.card title="💬 Üzenet">
        <p style="{{ EmailStyle::TEXT }}margin:0;white-space:pre-line;">{{ $contactMessage->message }}</p>
    </x-email.card>
</x-email.layout>
