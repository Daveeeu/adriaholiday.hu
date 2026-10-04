<?php

namespace App\Support;

/**
 * The company's public contact details shown in the site header, footer and
 * contact page, as published on the legacy adriaholiday.hu site.
 */
final class CompanyContact
{
    public const GROUP = 'contact';

    /**
     * @var array<string, array{type: string, value: string}>
     */
    public const DEFAULTS = [
        'phone' => ['type' => 'string', 'value' => '+36 46 508 688'],
        'email' => ['type' => 'string', 'value' => 'adriaholiday@adriaholiday.hu'],
        'address' => ['type' => 'text', 'value' => '3530 Miskolc, Városház tér 22.'],
        'whatsapp' => ['type' => 'string', 'value' => ''],
        'opening_hours' => ['type' => 'text', 'value' => "Hétfő–Péntek: 08:00–16:00\nSzombat–Vasárnap: zárva"],
    ];
}
