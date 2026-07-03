<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingsSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->defaults() as $setting) {
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
            ['group' => 'contact', 'key' => 'phone', 'type' => 'string', 'is_public' => true, 'value' => '+36 1 234 5678'],
            ['group' => 'contact', 'key' => 'email', 'type' => 'string', 'is_public' => true, 'value' => 'info@adriaholiday.hu'],
            ['group' => 'contact', 'key' => 'address', 'type' => 'text', 'is_public' => true, 'value' => "1051 Budapest\nPélda utca 12."],
            ['group' => 'contact', 'key' => 'whatsapp', 'type' => 'string', 'is_public' => true, 'value' => '36123456789'],
            ['group' => 'social', 'key' => 'facebook', 'type' => 'string', 'is_public' => true, 'value' => ''],
            ['group' => 'social', 'key' => 'instagram', 'type' => 'string', 'is_public' => true, 'value' => ''],
            ['group' => 'social', 'key' => 'tiktok', 'type' => 'string', 'is_public' => true, 'value' => ''],
            ['group' => 'header', 'key' => 'navigation', 'type' => 'json', 'is_public' => true, 'value' => [
                ['label' => 'Utazások', 'to' => '/utazasok'],
                ['label' => 'Blog', 'to' => '/blog'],
                ['label' => 'Rólunk', 'to' => '/rolunk'],
                ['label' => 'Kapcsolat', 'to' => '/kapcsolat'],
            ]],
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
            ['group' => 'seo', 'key' => 'default_title', 'type' => 'string', 'is_public' => true, 'value' => 'Adria Holiday'],
            ['group' => 'seo', 'key' => 'default_description', 'type' => 'text', 'is_public' => true, 'value' => 'Prémium buszos és repülős utazások Európa legszebb úti céljaihoz.'],
            ['group' => 'seo', 'key' => 'default_og_image', 'type' => 'media', 'is_public' => true, 'value' => null],
            ['group' => 'analytics', 'key' => 'meta_pixel_enabled', 'type' => 'boolean', 'is_public' => false, 'value' => false],
            ['group' => 'analytics', 'key' => 'meta_pixel_id', 'type' => 'string', 'is_public' => false, 'value' => ''],
            ['group' => 'legal', 'key' => 'imprint_url', 'type' => 'string', 'is_public' => true, 'value' => '/impresszum'],
            ['group' => 'legal', 'key' => 'privacy_url', 'type' => 'string', 'is_public' => true, 'value' => '/adatvedelem'],
            ['group' => 'legal', 'key' => 'terms_url', 'type' => 'string', 'is_public' => true, 'value' => '/aszf'],
            ['group' => 'legal', 'key' => 'cookie_url', 'type' => 'string', 'is_public' => true, 'value' => '/sutik'],
        ];
    }
}
