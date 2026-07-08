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
            ['group' => 'social', 'key' => 'facebook', 'type' => 'string', 'is_public' => true, 'value' => 'https://www.facebook.com/adriaholiday'],
            ['group' => 'social', 'key' => 'instagram', 'type' => 'string', 'is_public' => true, 'value' => 'https://www.instagram.com/adriaholiday'],
            ['group' => 'social', 'key' => 'tiktok', 'type' => 'string', 'is_public' => true, 'value' => ''],
            ['group' => 'header', 'key' => 'navigation', 'type' => 'json', 'is_public' => true, 'value' => [
                ['label' => 'Utazások', 'to' => '/utazasok'],
                ['label' => 'Rólunk', 'to' => '/rolunk'],
                ['label' => 'Kapcsolat', 'to' => '/kapcsolat'],
            ]],
            ['group' => 'footer', 'key' => 'description', 'type' => 'text', 'is_public' => true, 'value' => 'Prémium buszos utazások Európa legszebb úti céljaihoz. 15 év tapasztalat, 10 000+ elégedett utas, és számtalan felejthetetlen élmény.'],
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
            ['group' => 'legal', 'key' => 'about_content', 'type' => 'text', 'is_public' => true, 'value' => "Az Adria Holiday célja, hogy átlátható, biztonságos és inspiráló utazási élményt adjon.\n\nEzen az oldalon röviden bemutathatod a márka történetét, a csapatot és azt, hogyan dolgoztok az ügyfelekkel."],
            ['group' => 'legal', 'key' => 'contact_content', 'type' => 'text', 'is_public' => true, 'value' => "Vedd fel velünk a kapcsolatot telefonon, e-mailben vagy WhatsAppon.\n\nA lenti elérhetőségeken munkaidőben gyorsan válaszolunk, ajánlatkérés esetén pedig rövid időn belül visszajelzünk."],
            ['group' => 'legal', 'key' => 'imprint_content', 'type' => 'text', 'is_public' => true, 'value' => "Ez az oldal a szolgáltató hivatalos azonosító adatait tartalmazza.\n\nAdd meg itt a cégnév, székhely, adószám, cégjegyzékszám, nyilvántartó hatóság és kapcsolattartási adatok végleges szövegét."],
            ['group' => 'legal', 'key' => 'privacy_content', 'type' => 'text', 'is_public' => true, 'value' => "Az adatkezelési tájékoztató ismerteti, milyen személyes adatokat kezeltek, milyen jogalapon és mennyi ideig.\n\nRészletezd a kapcsolatfelvételi űrlapok, ajánlatkérések, analitikai sütik és marketing rendszerek adatkezelését."],
            ['group' => 'legal', 'key' => 'terms_content', 'type' => 'text', 'is_public' => true, 'value' => "Az ÁSZF oldal a foglalási, fizetési, lemondási és felelősségi feltételek összefoglaló helye.\n\nA production indulás előtt cseréld ezt a mintaszöveget a végleges jogi tartalomra."],
            ['group' => 'legal', 'key' => 'cookie_content', 'type' => 'text', 'is_public' => true, 'value' => "A cookie tájékoztató mutassa be a feltétlenül szükséges, analitikai és marketing sütik célját.\n\nÍrd le, hogyan módosítható a hozzájárulás, és mely szolgáltatók kapnak adatot a sütikből."],
        ];
    }
}
