<?php

namespace App\Support\Mail;

use App\Models\SiteSetting;
use App\Support\Booking\BookingConfirmationSettings;
use App\Support\CompanyContact;

/**
 * The agency's name, logo and contact details for the emails' header and
 * footer, taken from the admin-managed site settings.
 */
final class EmailCompany
{
    /**
     * @return array{name: string, logoUrl: ?string, address: string, phones: array<int, string>, email: string, website: string, websiteLabel: string, license: string}
     */
    public static function resolve(): array
    {
        $contact = SiteSetting::valuesOf(CompanyContact::GROUP, ['address', 'phone', 'phones', 'email']);
        $site = SiteSetting::query()
            ->where(fn ($query) => $query->where('group', 'general')->where('key', 'site_name'))
            ->orWhere(fn ($query) => $query->where('group', 'brand')->where('key', 'logo'))
            ->get()
            ->mapWithKeys(fn (SiteSetting $setting): array => [$setting->key => $setting->decodedValue()]);
        $website = rtrim((string) config('app.url'), '/');

        return [
            'name' => (string) ($site->get('site_name') ?: config('app.name')),
            'logoUrl' => $site->get('logo')['url'] ?? null,
            'address' => (string) ($contact->get('address') ?? CompanyContact::DEFAULTS['address']['value']),
            'phones' => CompanyContact::phoneNumbers(
                $contact->get('phones'),
                $contact->get('phone') ?? CompanyContact::DEFAULTS['phone']['value'],
            ),
            'email' => (string) ($contact->get('email') ?? CompanyContact::DEFAULTS['email']['value']),
            'website' => $website,
            'websiteLabel' => (string) preg_replace('#^https?://#', '', $website),
            'license' => BookingConfirmationSettings::load()->agencyLicenseNumber,
        ];
    }
}
