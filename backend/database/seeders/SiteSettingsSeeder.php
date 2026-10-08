<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use App\Support\Booking\BookingConfirmationSettings;
use App\Support\Booking\BookingInsuranceSettings;
use App\Support\Booking\BookingPaymentSettings;
use App\Support\CompanyContact;
use App\Support\LegalPageContent;
use Illuminate\Database\Seeder;

class SiteSettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ...$this->defaults(),
            ...$this->contactDefaults(),
            ...$this->legalContentDefaults(),
            ...$this->bookingDefaults(),
        ];

        foreach ($settings as $setting) {
            SiteSetting::query()->updateOrCreate(
                [
                    'group' => $setting['group'],
                    'key' => $setting['key'],
                ],
                [
                    'type' => $setting['type'],
                    'is_public' => $setting['is_public'],
                    'value' => SiteSetting::encodeValue($setting['type'], $setting['value']),
                ],
            );
        }
    }

    /**
     * @return array<int, array{group: string, key: string, type: string, is_public: bool, value: mixed}>
     */
    private function defaults(): array
    {
        return [
            ['group' => 'general', 'key' => 'site_name', 'type' => 'string', 'is_public' => true, 'value' => 'Adria Holiday'],
            ['group' => 'brand', 'key' => 'logo', 'type' => 'media', 'is_public' => true, 'value' => null],
            ['group' => 'social', 'key' => 'facebook', 'type' => 'string', 'is_public' => true, 'value' => 'https://www.facebook.com/adriaholiday'],
            ['group' => 'social', 'key' => 'instagram', 'type' => 'string', 'is_public' => true, 'value' => 'https://www.instagram.com/adriaholidayutazasok/'],
            ['group' => 'social', 'key' => 'tiktok', 'type' => 'string', 'is_public' => true, 'value' => 'https://www.tiktok.com/@adria.holiday'],
            ['group' => 'header', 'key' => 'navigation', 'type' => 'json', 'is_public' => true, 'value' => [
                ['label' => 'Utazások', 'to' => '/utazasok'],
                ['label' => 'Rólunk', 'to' => '/rolunk'],
                ['label' => 'Kapcsolat', 'to' => '/kapcsolat'],
            ]],
            ['group' => 'footer', 'key' => 'description', 'type' => 'text', 'is_public' => true, 'value' => 'Prémium autóbuszos utazások Európa legszebb úti céljaihoz. 22+ év tapasztalat, 10 000+ elégedett utas, és számtalan felejthetetlen élmény.'],
            ['group' => 'footer', 'key' => 'copyright', 'type' => 'string', 'is_public' => true, 'value' => '© 2026 Adria Holiday. Minden jog fenntartva.'],
            ['group' => 'footer', 'key' => 'quick_links', 'type' => 'json', 'is_public' => true, 'value' => [
                ['label' => 'Utazások', 'to' => '/utazasok'],
                ['label' => 'Rólunk', 'to' => '/rolunk'],
                ['label' => 'Kapcsolat', 'to' => '/kapcsolat'],
                ['label' => 'ÁSZF', 'to' => '/aszf'],
                ['label' => 'Adatvédelem', 'to' => '/adatvedelem'],
            ]],
            ['group' => 'cta', 'key' => 'primary_text', 'type' => 'string', 'is_public' => true, 'value' => 'Ajánlatot kérek'],
            ['group' => 'cta', 'key' => 'primary_link', 'type' => 'string', 'is_public' => true, 'value' => '/kapcsolat'],
            ['group' => 'seo', 'key' => 'default_title', 'type' => 'string', 'is_public' => true, 'value' => 'Körutazások és tengerparti nyaralás 2003 óta | Adria Holiday'],
            ['group' => 'seo', 'key' => 'default_description', 'type' => 'text', 'is_public' => true, 'value' => 'Autóbuszos és repülős körutazások, adventi utak és tengerparti nyaralás 2003 óta. Válogatott szállások, magyar idegenvezetés, online foglalás.'],
            ['group' => 'seo', 'key' => 'default_og_image', 'type' => 'media', 'is_public' => true, 'value' => null],
            ['group' => 'analytics', 'key' => 'meta_pixel_enabled', 'type' => 'boolean', 'is_public' => false, 'value' => false],
            ['group' => 'analytics', 'key' => 'meta_pixel_id', 'type' => 'string', 'is_public' => false, 'value' => ''],
            ['group' => 'newsletter', 'key' => 'coupon_value', 'type' => 'number', 'is_public' => true, 'value' => 5000],
            ['group' => 'legal', 'key' => 'imprint_url', 'type' => 'string', 'is_public' => true, 'value' => '/impresszum'],
            ['group' => 'legal', 'key' => 'privacy_url', 'type' => 'string', 'is_public' => true, 'value' => '/adatvedelem'],
            ['group' => 'legal', 'key' => 'terms_url', 'type' => 'string', 'is_public' => true, 'value' => '/aszf'],
            ['group' => 'legal', 'key' => 'cookie_url', 'type' => 'string', 'is_public' => true, 'value' => '/sutik'],
        ];
    }

    /**
     * @return array<int, array{group: string, key: string, type: string, is_public: bool, value: mixed}>
     */
    private function contactDefaults(): array
    {
        return collect(CompanyContact::DEFAULTS)
            ->map(fn (array $setting, string $key): array => [
                'group' => CompanyContact::GROUP,
                'key' => $key,
                'type' => $setting['type'],
                'is_public' => true,
                'value' => $setting['value'],
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{group: string, key: string, type: string, is_public: bool, value: mixed}>
     */
    private function legalContentDefaults(): array
    {
        return collect(LegalPageContent::defaults())
            ->map(fn (string $html, string $key): array => [
                'group' => LegalPageContent::GROUP,
                'key' => $key,
                'type' => LegalPageContent::TYPE,
                'is_public' => true,
                'value' => $html,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{group: string, key: string, type: string, is_public: bool, value: mixed}>
     */
    private function bookingDefaults(): array
    {
        $public = collect([...BookingInsuranceSettings::DEFAULTS, ...BookingPaymentSettings::DEFAULTS])
            ->map(fn (array $setting): array => [...$setting, 'is_public' => true]);
        $private = collect(BookingConfirmationSettings::DEFAULTS)
            ->map(fn (array $setting): array => [...$setting, 'is_public' => false]);

        return $public->merge($private)
            ->map(fn (array $setting, string $key): array => [
                'group' => BookingInsuranceSettings::GROUP,
                'key' => $key,
                'type' => $setting['type'],
                'is_public' => $setting['is_public'],
                'value' => $setting['value'],
            ])
            ->values()
            ->all();
    }
}
