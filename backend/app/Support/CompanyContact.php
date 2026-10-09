<?php

namespace App\Support;

/**
 * The company's public contact details shown in the site header, footer and
 * contact page, as published on the legacy adriaholiday.hu site. "phone" is
 * the main number the header shows; "phones" lists every office number, one
 * per line, for the footer, the contact page and the documents.
 */
final class CompanyContact
{
    public const GROUP = 'contact';

    /**
     * @var array<string, array{type: string, value: string}>
     */
    public const DEFAULTS = [
        'phone' => ['type' => 'string', 'value' => '+36 46 508 688'],
        'phones' => ['type' => 'text', 'value' => "+36 46 508 688\n+36 46 508 689\n+36 30 111 1254\n+36 30 128 1007"],
        'email' => ['type' => 'string', 'value' => 'adriaholiday@adriaholiday.hu'],
        'address' => ['type' => 'text', 'value' => '3530 Miskolc, Városház tér 22.'],
        'whatsapp' => ['type' => 'string', 'value' => ''],
        'opening_hours' => ['type' => 'text', 'value' => "Hétfő–Péntek: 08:00–17:00\nSzombat–Vasárnap: zárva"],
    ];

    /**
     * Every office number: the "phones" list, or the main number while the list is empty.
     *
     * @return array<int, string>
     */
    public static function phoneNumbers(mixed $phones, mixed $mainPhone): array
    {
        $numbers = collect(preg_split('/\R/', (string) $phones) ?: [])
            ->map(fn (string $number): string => trim($number))
            ->filter()
            ->unique()
            ->values()
            ->all();

        if ($numbers !== []) {
            return $numbers;
        }

        $mainPhone = trim((string) $mainPhone);

        return $mainPhone !== '' ? [$mainPhone] : [];
    }
}
