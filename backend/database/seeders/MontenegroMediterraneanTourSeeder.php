<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use App\Models\BlogCategoryTranslation;
use App\Models\BlogTag;
use App\Models\BlogTagTranslation;
use App\Models\Gallery;
use App\Models\Region;
use App\Models\Tour;
use App\Models\TourDeparturePlace;
use App\Models\TourReferenceOption;
use App\Models\TourRegionGroup;
use App\Models\TourSeasonalGroup;
use App\Support\MediaCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MontenegroMediterraneanTourSeeder extends Seeder
{
    public function run(): void
    {
        $region = Region::query()->where('slug', 'montenegro')->first();

        if (! $region) {
            return;
        }

        $this->ensureReferenceOption('travel-mode', 'bus', 'Busz', 1);
        $this->ensureReferenceOption('program-type', 'classic-tour', 'Klasszikus körút', 1);
        $this->ensureReferenceOption('difficulty', 'easy', 'Könnyű', 1);

        $group = $this->ensureRegionGroup();
        $seasonalGroup = TourSeasonalGroup::query()->updateOrCreate(
            ['seo_name' => 'nyari-ajanlatok'],
            [
                'active' => true,
                'menu_type' => 'featured',
                'name' => 'Nyári ajánlatok',
                'seo_auto_generate' => true,
                'box_text' => 'Nyári tengerparti és körutas ajánlatok.',
                'has_offers' => true,
            ],
        );

        $categoryIds = array_values(array_filter([
            $this->ensureCategory('Körutazások', 'korutazasok'),
            $this->ensureCategory('Körutazás'),
            $this->ensureCategory('Buszos körutazás'),
            $this->ensureCategory('Tengerpart és városnézés'),
        ]));

        $tagIds = array_values(array_filter([
            $this->ensureTag('Montenegró'),
            $this->ensureTag('Kotori-öböl'),
            $this->ensureTag('Budva'),
            $this->ensureTag('Dubrovnik'),
            $this->ensureTag('Tengerpart'),
            $this->ensureTag('Városnézés'),
            $this->ensureTag('Természet'),
            $this->ensureTag('Meleg úti célok'),
        ]));

        $departurePlaceIds = collect([
            'Miskolc',
            'Mezőkövesd',
            'Gyöngyös',
            'Hatvan',
            'Budapest',
            'Dunaújváros',
            'Paks',
            'Szekszárd',
            'Mohács',
        ])->map(fn (string $name): int => $this->ensureDeparturePlace($name)->id)->all();

        $galleryItems = [
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/151989_5a97ae6e94567/66a7336f7696a9.77839157.jpg&op=;1200x800;',
                'file_name' => 'montenegro-mediterranean-gallery-1.jpg',
                'title' => 'Montenegrói tengerpart',
                'alt' => 'Montenegrói tengerparti panoráma',
                'caption' => 'Tengerparti pihenés a Kotori-öböl térségében',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/151989_5a97ae6e94567/5efd8bf7c27183.02529035.jpg&op=;1200x800;',
                'file_name' => 'montenegro-mediterranean-gallery-2.jpg',
                'title' => 'Útvonal térkép',
                'alt' => 'Montenegrói körutazás útvonala',
                'caption' => 'Budva, Kotor, Tivat, Perast és Dubrovnik útvonala',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/151989_5a97ae6e94567/60f2931f2583b3.23844791.jpg&op=;1200x800;',
                'file_name' => 'montenegro-mediterranean-gallery-3.jpg',
                'title' => 'Kotori-öböl',
                'alt' => 'Kilátás a Kotori-öbölre',
                'caption' => 'A Kotori-öböl mediterrán hangulata',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/151989_5a97ae6e94567/618512a53a7f11.35086547.jpg&op=;1200x800;',
                'file_name' => 'montenegro-mediterranean-gallery-4.jpg',
                'title' => 'Tengerparti városkép',
                'alt' => 'Montenegrói városrész a tengerparton',
                'caption' => 'Pihenés és városnézés egy útban',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/151989_5a97ae6e94567/5a97aea74ab761.70456517.jpg&op=;1200x800;',
                'file_name' => 'montenegro-mediterranean-gallery-5.jpg',
                'title' => 'Perast',
                'alt' => 'Perast történelmi városképe',
                'caption' => 'Reneszánsz paloták és öbölparti látvány',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/151989_5a97ae6e94567/5f648c673b6e84.15935703.jpg&op=;1200x800;',
                'file_name' => 'montenegro-mediterranean-gallery-6.jpg',
                'title' => 'Kotor',
                'alt' => 'Kotor óvárosa',
                'caption' => 'UNESCO világörökségi városnézés',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/151989_5a97ae6e94567/646cd1e94af329.56817247.jpg&op=;1200x800;',
                'file_name' => 'montenegro-mediterranean-gallery-7.jpg',
                'title' => 'Kék-barlang',
                'alt' => 'Kék-barlang és tengeri kirándulás',
                'caption' => 'Fakultatív hajókirándulás a nyílt tengeren',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/151989_5a97ae6e94567/646cd2048f4413.25041438.jpg&op=;1200x800;',
                'file_name' => 'montenegro-mediterranean-gallery-8.jpg',
                'title' => 'Tengeröböl',
                'alt' => 'Montenegrói tengeri öböl',
                'caption' => 'Türkiz víz és mediterrán partszakasz',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/151989_5a97ae6e94567/5f648c673a5d99.46940366.jpg&op=;1200x800;',
                'file_name' => 'montenegro-mediterranean-gallery-9.jpg',
                'title' => 'Budva hangulat',
                'alt' => 'Budva óvárosi részlet',
                'caption' => 'Budva mediterrán utcái',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/151989_5a97ae6e94567/5f648c673ad177.43386206.jpg&op=;1200x800;',
                'file_name' => 'montenegro-mediterranean-gallery-10.jpg',
                'title' => 'Dubrovnik',
                'alt' => 'Dubrovnik történelmi városfala',
                'caption' => 'Fakultatív kirándulás Dubrovnikba',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/151989_5a97ae6e94567/5a97aec2475c82.04911806.jpg&op=;1200x800;',
                'file_name' => 'montenegro-mediterranean-gallery-11.jpg',
                'title' => 'Montenegrói panoráma',
                'alt' => 'Panoráma a montenegrói tengerparton',
                'caption' => 'Mediterrán nyaralás félpanzióval',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/151989_5a97ae6e94567/646cd222b6efc3.85877524.jpg&op=;1200x800;',
                'file_name' => 'montenegro-mediterranean-gallery-12.jpg',
                'title' => 'Tengerparti kikötő',
                'alt' => 'Montenegrói tengerparti kikötő',
                'caption' => 'Kikapcsolódás és városnézés a partvidéken',
            ],
        ];

        $programDays = [
            [
                'day_number' => 1,
                'title' => 'Indulás a Kotori-öböl felé',
                'description' => '<p>Indulás a kora hajnali órákban, folyamatos utazás rövid pihenőkkel. Az esti órákban, a határátlépésektől függően, szállás elfoglalása a Kotori-öböl térségében.</p>',
                'icon' => 'bus',
                'experience_type' => 'Utazás',
                'badges' => ['Kotori-öböl', 'Érkezés'],
                'image_index' => 2,
            ],
            [
                'day_number' => 2,
                'title' => 'Szabadprogram a tengerparton',
                'description' => '<p>Szabadprogram, pihenés a tengerparton fakultatív kirándulási lehetőségekkel.</p>',
                'icon' => 'beach',
                'experience_type' => 'Pihenés',
                'badges' => ['Tengerpart', 'Szabadidő'],
                'image_index' => 0,
            ],
            [
                'day_number' => 3,
                'title' => 'Dubrovnik fakultatív kirándulás',
                'description' => '<p>Szabadprogram, pihenés a tengerparton, vagy fakultatív kirándulás Dubrovnikba, az „Adria királynőjébe”. A program során látható a Pile-kapu, a Minčeta torony, a Szent Balázs-templom, az Orlando-oszlop, az Onofrio-kút és a Szűz Mária-katedrális. Délután visszautazás a szállásra. A kirándulás díja 35 euro / fő (minimum 25 fő esetén).</p>',
                'icon' => 'landmark',
                'experience_type' => 'Városnézés',
                'badges' => ['Dubrovnik', 'Fakultatív'],
                'image_index' => 9,
            ],
            [
                'day_number' => 4,
                'title' => 'Perast, Kotor és Tivat',
                'description' => '<p>Körbeutazzuk a Kotori-öblöt. Perast reneszánsz palotáiról híres, innen kishajóval látogatjuk meg a Szirti Madonna-szigetet. Ezt követően Kotor UNESCO világörökségi óvárosa következik, majd Tivat érintésével térünk vissza a szállásra.</p>',
                'icon' => 'map-pin',
                'experience_type' => 'Városnézés',
                'badges' => ['Perast', 'Kotor', 'Tivat'],
                'image_index' => 4,
            ],
            [
                'day_number' => 5,
                'title' => 'Žanjice, Kék-barlang és Mamula-sziget',
                'description' => '<p>Szabadprogram vagy fakultatív hajókirándulás Mamula–Žanjice–Kék-barlang útvonalon. Žanjice nyílt tengeri strandja, a foszforeszkáló türkiz vizű Kék-barlang és a Mamula-sziget erődítménye szerepel a programban. Az időjárástól függően a program sorrendje módosulhat. A kirándulás díja 32 euro / fő (minimum 25 fő esetén).</p>',
                'icon' => 'camera',
                'experience_type' => 'Tengerpart és hajózás',
                'badges' => ['Kék-barlang', 'Mamula'],
                'image_index' => 6,
            ],
            [
                'day_number' => 6,
                'title' => 'Budva fakultatív városnézés',
                'description' => '<p>Szabadprogram, pihenés a tengerparton vagy fakultatív kirándulás Budvába, Montenegró egyik leghangulatosabb városába. Ódon utcácskák, üzletek és vendéglők várják az idelátogatókat, a délutáni órákban pedig visszautazás a szállásra történik. A kirándulás díja 25 euro / fő (minimum 25 fő esetén).</p>',
                'icon' => 'museum',
                'experience_type' => 'Városnézés',
                'badges' => ['Budva', 'Fakultatív'],
                'image_index' => 8,
            ],
            [
                'day_number' => 7,
                'title' => 'Szabadprogram fakultatív lehetőségekkel',
                'description' => '<p>Szabadprogram, pihenés a tengerparton fakultatív kirándulási lehetőségekkel.</p>',
                'icon' => 'beach',
                'experience_type' => 'Pihenés',
                'badges' => ['Tengerpart', 'Szabadidő'],
                'image_index' => 10,
            ],
            [
                'day_number' => 8,
                'title' => 'Hazautazás',
                'description' => '<p>Reggeli után hazautazás, folyamatos utazás rövid pihenőkkel. Érkezés a késő éjjeli vagy másnap hajnali órákban, a határátlépésektől függően.</p>',
                'icon' => 'bus',
                'experience_type' => 'Utazás',
                'badges' => ['Hazautazás'],
                'image_index' => 11,
            ],
        ];

        $tourAttributes = [
            'sort_order' => 9,
            'active' => true,
            'featured' => true,
            'recommended' => false,
            'partner_offer' => false,
            'image_offer' => true,
            'xml_enabled' => false,
            'slider_image_enabled' => true,
            'slider_text_enabled' => false,
            'name' => 'Montenegró, a mediterrán csoda félpanzióval',
            'seo_name' => 'montenegro-a-mediterran-csoda-felpanzioval',
            'seo_auto_generate' => false,
            'action1' => 'Budva - Kotor - Tivat - Perast - Dubrovnik',
            'action2' => 'Autóbuszos montenegrói körutazás félpanzióval',
            'list_description' => 'Montenegrói tengerparti körút a Kotori-öbölben, Dubrovnikkal, Budvával, Perasttal és fakultatív hajókirándulásokkal.',
            'short_description' => 'Kotori-öböl, Budva, Kotor, Perast és Dubrovnik látnivalói, 7 éj hotel***, félpanzió és autóbuszos utazás egy montenegrói körúton.',
            'program_pdf_path' => null,
            'program_pdf_file' => null,
            'slider_image' => null,
            'program_before' => '<p>Montenegrói tengerparti körutazás a Kotori-öböl térségében, félpanzióval, városnézésekkel és fakultatív hajókirándulásokkal.</p>',
            'program' => '<p><strong>Útvonal:</strong> Budva - Kotor - Tivat - Perast - Dubrovnik.</p>',
            'inclusions' => '<p><strong>Csatlakozási lehetőségek:</strong> Miskolc, Mezőkövesd, Gyöngyös, Hatvan, Budapest, Dunaújváros, Paks, Szekszárd, Mohács.</p><p><strong>Beutazási feltételek:</strong> <a href="https://konzinfo.mfa.gov.hu/utazasi-tanacsok-orszagonkent/montenegro">Montenegró konzuli tájékoztató</a>.</p>',
            'payment_program' => '<p><strong>További fakultatív programok:</strong></p><ul><li><strong>Dubrovnik:</strong> 35 euro / fő (min. 25 fő esetén)</li><li><strong>Bosznia egzotikus világa – Mostar, Blagaj derviskolostor:</strong> 35 euro / fő (min. 25 fő)</li><li><strong>Hajókirándulás a Skodra-tavon:</strong> 55 euro / fő (min. 25 fő)</li><li><strong>Žanjice – Kék-barlang – Mamula-sziget:</strong> 32 euro / fő (min. 25 fő)</li><li><strong>Budva:</strong> 25 euro / fő (min. 25 fő)</li></ul><p>A Mostar-program során Blagaj derviskolostora, Mostar óvárosa és az Öreg-híd is szerepel. A Skodra-tavi hajókirándulás a balkáni gasztronómia kóstolójával zárul.</p>',
            'prices' => '<p><strong>Részvételi díjak:</strong></p><ul><li>2026.07.04-11: 338.600 Ft / fő</li><li>2026.08.15-22: 359.900 Ft / fő</li><li>2026.09.12-19: 259.900 Ft / fő</li></ul><p><strong>Milyen további költségek merülhetnek fel?</strong></p><ul><li>Üdülőhelyi illeték: 5.900 Ft / fő</li><li>Egyágyas felár: 78.000-105.000 Ft / fő időponttól függően</li><li>Kötelező bosnyák belépési illeték (helyszínen fizetendő): 15 euro / fő</li><li>Betegség-, baleset- és poggyászbiztosítás: 540 Ft / fő / nap</li><li>Útlemondási biztosítás: a részvételi díj 2,8%-a</li></ul>',
            'discounts' => null,
            'notes' => json_encode([
                'transport' => 'bus',
                'accommodation' => 'Hotel***',
                'hotel' => 'Hotel***',
                'meals' => 'félpanzió',
                'country' => 'Montenegró',
                'duration' => '8 nap / 7 éj',
                'departureDateLabel' => '2026.09.12. - 2026.09.19.',
                'additionalDates' => true,
                'badge' => 'Montenegró',
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'gallery_title' => 'Galéria',
            'gallery_subtitle' => 'Kotori-öböl, tengerparti panorámák és mediterrán városok képekben.',
            'region_id' => $region->id,
            'group_id' => $group->seo_name,
            'seasonal_group_id' => $seasonalGroup->seo_name,
            'fit_id' => null,
            'program_type_id' => 'classic-tour',
            'travel_mode_id' => 'bus',
            'difficulty_id' => 'easy',
            'country_ids' => ['me', 'hr'],
            'tag_ids' => $tagIds,
            'category_ids' => $categoryIds,
            'price' => 259900,
            'price_box_price' => 259900,
            'price_box_displayed_price' => '259.900 Ft/fő-től',
            'price_box_currency' => 'HUF',
            'price_box_price_suffix' => '/fő-től',
            'price_box_discount_badge' => null,
            'price_box_discount_text' => null,
            'price_box_urgency_text' => null,
            'price_box_rating_text' => null,
            'price_box_min_participants' => null,
            'price_box_max_participants' => null,
            'price_box_available_seats' => null,
            'price_box_capacity' => null,
            'price_box_cta_primary_label' => 'Ajánlatot kérek',
            'price_box_cta_secondary_label' => null,
            'displayed_price' => '259.900 Ft/fő-től',
            'slider_text' => null,
        ];

        $tour = Tour::query()->withTrashed()->where('seo_name', $tourAttributes['seo_name'])->first();

        if ($tour) {
            if ($tour->trashed()) {
                $tour->restore();
            }

            $tour->fill($tourAttributes)->save();
        } else {
            $tour = Tour::query()->create($tourAttributes);
        }

        $tour->departurePlaces()->sync($departurePlaceIds);

        $tour->dates()->withTrashed()->get()->each->forceDelete();
        $tour->programDays()->delete();
        $tour->priceItems()->delete();
        $tour->galleryItems()->delete();
        $tour->clearMediaCollection('slider');
        $tour->clearMediaCollection('tour-gallery');
        $tour->clearMediaCollection('tour-program-days');

        $this->createMediaFromUrl(
            $tour,
            'slider',
            $galleryItems[0]['url'],
            $galleryItems[0]['file_name'],
            $tour->name,
            [
                'category' => MediaCategory::TOURS->value,
                'source_context' => 'tour',
                'source_id' => $tour->id,
                'alt' => $tour->name,
                'title' => $tour->name,
            ],
        );

        foreach ($galleryItems as $index => $image) {
            $media = $this->createMediaFromUrl(
                $tour,
                'tour-gallery',
                $image['url'],
                $image['file_name'],
                $image['title'] ?? $tour->name,
                [
                    'category' => MediaCategory::TOURS->value,
                    'source_context' => 'tour_gallery',
                    'source_id' => $tour->id,
                    'alt' => $image['alt'],
                    'title' => $image['title'] ?? $tour->name,
                ],
            );

            if (! $media) {
                continue;
            }

            $tour->galleryItems()->create([
                'media_id' => $media->id,
                'title' => $image['title'],
                'alt' => $image['alt'],
                'caption' => $image['caption'],
                'sort_order' => $index + 1,
                'active' => true,
            ]);
        }

        foreach ($programDays as $index => $day) {
            $gallerySource = $galleryItems[$day['image_index']];
            $media = $this->createMediaFromUrl(
                $tour,
                'tour-program-days',
                $gallerySource['url'],
                'montenegro-mediterranean-program-day-'.($index + 1).'.'.pathinfo($gallerySource['file_name'], PATHINFO_EXTENSION),
                $day['title'],
                [
                    'category' => MediaCategory::TOURS->value,
                    'source_context' => 'tour_program_day',
                    'source_id' => $tour->id,
                    'alt' => $gallerySource['alt'],
                    'title' => $day['title'],
                ],
            );

            $tour->programDays()->create([
                'sort_order' => $index + 1,
                'day_number' => $day['day_number'],
                'title' => $day['title'],
                'description' => $day['description'],
                'image' => $media?->getUrl() ?? $gallerySource['url'],
                'icon' => $day['icon'],
                'experience_type' => $day['experience_type'],
                'badges' => $day['badges'],
                'active' => true,
            ]);
        }

        foreach ([
            ['type' => 'included', 'text' => 'Autóbusz közlekedés'],
            ['type' => 'included', 'text' => '7 éj szállás hotel***'],
            ['type' => 'included', 'text' => '7 félpanzió'],
            ['type' => 'included', 'text' => 'Idegenvezetés'],
            ['type' => 'excluded', 'text' => 'Üdülőhelyi illeték: 5.900 Ft / fő'],
            ['type' => 'excluded', 'text' => 'Egyágyas felár: 78.000-105.000 Ft / fő időponttól függően'],
            ['type' => 'excluded', 'text' => 'Kötelező bosnyák belépési illeték (helyszínen fizetendő): 15 euro / fő'],
            ['type' => 'excluded', 'text' => 'Betegség-, baleset- és poggyászbiztosítás: 540 Ft / fő / nap'],
            ['type' => 'excluded', 'text' => 'Útlemondási biztosítás: a részvételi díj 2,8%-a'],
        ] as $index => $item) {
            $tour->priceItems()->create([
                'type' => $item['type'],
                'text' => $item['text'],
                'sort_order' => $index + 1,
                'active' => true,
            ]);
        }

        foreach ([
            ['start_date' => '2026-07-04', 'end_date' => '2026-07-11', 'price' => 338600],
            ['start_date' => '2026-08-15', 'end_date' => '2026-08-22', 'price' => 359900],
            ['start_date' => '2026-09-12', 'end_date' => '2026-09-19', 'price' => 259900],
        ] as $date) {
            $tour->dates()->create([
                'start_date' => $date['start_date'],
                'end_date' => $date['end_date'],
                'price' => $date['price'],
                'price_box_price' => $date['price'],
                'price_box_displayed_price' => number_format($date['price'], 0, ',', '.').' Ft/fő-től',
                'price_box_discount_badge' => null,
                'price_box_min_participants' => null,
                'price_box_max_participants' => null,
                'price_box_available_seats' => null,
                'price_box_capacity' => null,
                'status' => 'available',
            ]);
        }
    }

    private function ensureReferenceOption(string $type, string $code, string $name, int $sortOrder): TourReferenceOption
    {
        return TourReferenceOption::query()->updateOrCreate(
            ['type' => $type, 'code' => $code],
            [
                'name' => $name,
                'active' => true,
                'sort_order' => $sortOrder,
            ],
        );
    }

    private function ensureRegionGroup(): TourRegionGroup
    {
        return TourRegionGroup::query()->updateOrCreate(
            ['seo_name' => 'balkan-korutak'],
            [
                'active' => true,
                'featured_on_homepage' => false,
                'type' => 'group',
                'name' => 'Balkáni körutak',
                'seo_auto_generate' => true,
                'gallery_id' => Gallery::query()->value('id'),
                'description' => 'Balkáni körutazások Montenegrótól Albániáig.',
                'list_below_text' => 'Tengerparti pihenéssel és városnézéssel fűszerezett balkáni körutak.',
                'travel_conditions_link' => '/utazas-feltetelek/balkan-korutak',
            ],
        );
    }

    private function ensureDeparturePlace(string $name): TourDeparturePlace
    {
        return TourDeparturePlace::query()->updateOrCreate(
            ['name' => $name, 'city' => $name],
            [
                'active' => true,
                'fee' => null,
            ],
        );
    }

    private function ensureTag(string $name): ?string
    {
        $existing = BlogTagTranslation::query()
            ->where('locale', 'hu')
            ->where('name', $name)
            ->first();

        if ($existing) {
            return (string) $existing->blog_tag_id;
        }

        $tag = BlogTag::query()->create([
            'active' => true,
            'sort_order' => ((int) BlogTag::query()->max('sort_order')) + 1,
        ]);

        foreach (['hu', 'en', 'de'] as $locale) {
            BlogTagTranslation::query()->updateOrCreate(
                ['blog_tag_id' => $tag->id, 'locale' => $locale],
                ['name' => $locale === 'hu' ? $name : $name.' '.Str::upper($locale)],
            );
        }

        return (string) $tag->id;
    }

    private function ensureCategory(string $name, ?string $seoName = null): ?string
    {
        $existing = BlogCategoryTranslation::query()
            ->where('locale', 'hu')
            ->where(function ($query) use ($name, $seoName): void {
                $query->where('name', $name);

                if ($seoName) {
                    $query->orWhere('seo_name', $seoName);
                }
            })
            ->first();

        if ($existing) {
            return (string) $existing->blog_category_id;
        }

        $seoName = $seoName ?: Str::slug($name);
        $category = BlogCategory::query()->create([
            'active' => true,
            'column' => '1',
            'seo_name' => $seoName,
            'sort_order' => ((int) BlogCategory::query()->max('sort_order')) + 1,
        ]);

        foreach (['hu', 'en', 'de'] as $locale) {
            BlogCategoryTranslation::query()->updateOrCreate(
                ['blog_category_id' => $category->id, 'locale' => $locale],
                [
                    'name' => $locale === 'hu' ? $name : $name.' '.Str::upper($locale),
                    'seo_name' => $locale === 'hu' ? $seoName : $seoName.'-'.$locale,
                    'seo_auto_generate' => true,
                ],
            );
        }

        return (string) $category->id;
    }

    private function createMediaFromUrl(
        Tour $tour,
        string $collection,
        string $url,
        string $fileName,
        ?string $name,
        array $metadata = [],
    ): ?Media {
        $contents = @file_get_contents($url);

        if ($contents === false) {
            return null;
        }

        $download = $tour->addMediaFromString($contents);

        if ($name) {
            $download->usingName($name);
        }

        $media = $download
            ->usingFileName($fileName)
            ->toMediaCollection($collection);

        $media->forceFill(array_filter([
            'category' => $metadata['category'] ?? null,
            'source_context' => $metadata['source_context'] ?? null,
            'source_id' => $metadata['source_id'] ?? null,
            'alt' => $metadata['alt'] ?? null,
            'title' => $metadata['title'] ?? $name,
        ], static fn ($value) => $value !== null && $value !== ''));

        $media->custom_properties = array_filter([
            ...($media->custom_properties ?? []),
            'category' => $metadata['category'] ?? null,
            'source_context' => $metadata['source_context'] ?? null,
            'source_id' => $metadata['source_id'] ?? null,
            'alt' => $metadata['alt'] ?? null,
            'title' => $metadata['title'] ?? $name,
        ], static fn ($value) => $value !== null && $value !== '');

        $media->save();

        return $media;
    }
}
