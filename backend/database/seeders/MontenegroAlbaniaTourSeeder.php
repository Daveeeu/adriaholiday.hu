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

class MontenegroAlbaniaTourSeeder extends Seeder
{
    public function run(): void
    {
        $region = Region::query()->where('slug', 'montenegro')->first();

        if (! $region) {
            return;
        }

        $this->ensureReferenceOption('country', 'me', 'Montenegró', 9);
        $this->ensureReferenceOption('travel-mode', 'bus', 'Busz', 1);
        $this->ensureReferenceOption('program-type', 'classic-tour', 'Klasszikus körút', 1);
        $this->ensureReferenceOption('difficulty', 'easy', 'Könnyű', 1);

        $group = $this->ensureRegionGroup();
        $seasonalGroup = TourSeasonalGroup::query()->updateOrCreate(
            ['seo_name' => 'oszi-utazasok'],
            [
                'active' => true,
                'menu_type' => 'travel',
                'name' => 'Őszi utazások',
                'seo_auto_generate' => true,
                'box_text' => 'Őszi körutazások és balkáni ajánlatok.',
                'has_offers' => true,
            ],
        );

        $categoryIds = array_values(array_filter([
            $this->ensureCategory('Körutazások', 'korutazasok'),
            $this->ensureCategory('Körutazás'),
            $this->ensureCategory('Buszos körutazás'),
            $this->ensureCategory('Kultúra és városnézés'),
        ]));

        $tagIds = array_values(array_filter([
            $this->ensureTag('Montenegró'),
            $this->ensureTag('Albánia'),
            $this->ensureTag('Balkán'),
            $this->ensureTag('Tengerpart'),
            $this->ensureTag('Városnézés'),
            $this->ensureTag('Természet'),
            $this->ensureTag('Meleg úti célok'),
            $this->ensureTag('Kultúra'),
        ]));

        $departurePlaceIds = collect([
            'Miskolc',
            'Mezőkövesd',
            'Gyöngyös',
            'Hatvan',
            'Budapest',
            'Kecskemét',
            'Kiskunfélegyháza',
            'Szeged',
        ])->map(fn (string $name): int => $this->ensureDeparturePlace($name)->id)->all();

        $galleryItems = [
            [
                'url' => 'https://adriaholiday.hu/korutazasok/framework/img.php?p=uploads/gallery/11516_39396181975_5063/60127ba5794a37.54490359.JPG&op=;1200x800;',
                'file_name' => 'montenegro-albania-gallery-1.jpg',
                'title' => 'Montenegrói tengerpart',
                'alt' => 'Montenegrói tengerparti hangulat',
                'caption' => 'Tengerparti pihenés és balkáni hangulat',
            ],
            [
                'url' => 'https://adriaholiday.hu/korutazasok/framework/img.php?p=uploads/gallery/11516_39396181975_5063/66616580cf4132.77702718.jpg&op=;1200x800;',
                'file_name' => 'montenegro-albania-gallery-2.jpg',
                'title' => 'Montenegró és Albánia útvonala',
                'alt' => 'Montenegró és Albánia körutazás térképe',
                'caption' => 'Kotor, Budva, Bar, Petrovac, Kruja és Rozafa állomásaival',
            ],
            [
                'url' => 'https://adriaholiday.hu/korutazasok/framework/img.php?p=uploads/gallery/11516_39396181975_5063/60f9a5eef17a62.86051698.jpg&op=;1200x800;',
                'file_name' => 'montenegro-albania-gallery-3.jpg',
                'title' => 'Adriai öböl',
                'alt' => 'Adriai öböl hajókkal és tengerparttal',
                'caption' => 'Montenegrói tengeri panoráma',
            ],
            [
                'url' => 'https://adriaholiday.hu/korutazasok/framework/img.php?p=uploads/gallery/11516_39396181975_5063/609397961ff1f9.63655629.jpg&op=;1200x800;',
                'file_name' => 'montenegro-albania-gallery-4.jpg',
                'title' => 'Óvárosi részlet',
                'alt' => 'Montenegrói óvárosi utcakép',
                'caption' => 'Kotor és Budva történelmi hangulata',
            ],
            [
                'url' => 'https://adriaholiday.hu/korutazasok/framework/img.php?p=uploads/gallery/11516_39396181975_5063/609397f37d99e4.92564752.jpg&op=;1200x800;',
                'file_name' => 'montenegro-albania-gallery-5.jpg',
                'title' => 'Tengerparti öböl',
                'alt' => 'Kék tengervíz és öböl a montenegrói parton',
                'caption' => 'Pihenés a montenegrói partszakaszon',
            ],
            [
                'url' => 'https://adriaholiday.hu/korutazasok/framework/img.php?p=uploads/gallery/11516_39396181975_5063/60127bf51a2ed0.04273857.jpg&op=;1200x800;',
                'file_name' => 'montenegro-albania-gallery-6.jpg',
                'title' => 'Templom és városkép',
                'alt' => 'Templomos, történelmi városkép a körutazás során',
                'caption' => 'Kulturális látnivalók Montenegróban',
            ],
            [
                'url' => 'https://adriaholiday.hu/korutazasok/framework/img.php?p=uploads/gallery/11516_39396181975_5063/60f9a6826ceee0.36813833.jpg&op=;1200x800;',
                'file_name' => 'montenegro-albania-gallery-7.jpg',
                'title' => 'Parti panoráma',
                'alt' => 'Montenegrói tengerparti panoráma',
                'caption' => 'Tengerparti kilátás és pihenés',
            ],
            [
                'url' => 'https://adriaholiday.hu/korutazasok/framework/img.php?p=uploads/gallery/11516_39396181975_5063/636a56446bbb77.78851869.jpg&op=;1200x800;',
                'file_name' => 'montenegro-albania-gallery-8.jpg',
                'title' => null,
                'alt' => 'Montenegró Albánia kincseivel fűszerezve galéria',
                'caption' => null,
            ],
            [
                'url' => 'https://adriaholiday.hu/korutazasok/framework/img.php?p=uploads/gallery/11516_39396181975_5063/64b91b46b721b4.97658136.jpg&op=;1200x800;',
                'file_name' => 'montenegro-albania-gallery-9.jpg',
                'title' => null,
                'alt' => 'Montenegró Albánia kincseivel fűszerezve galéria',
                'caption' => null,
            ],
            [
                'url' => 'https://adriaholiday.hu/korutazasok/framework/img.php?p=uploads/gallery/11516_39396181975_5063/64b91b46eb8914.89969992.jpg&op=;1200x800;',
                'file_name' => 'montenegro-albania-gallery-10.jpg',
                'title' => null,
                'alt' => 'Montenegró Albánia kincseivel fűszerezve galéria',
                'caption' => null,
            ],
        ];

        $programDays = [
            [
                'day_number' => 1,
                'title' => 'Ulcinj: indulás a Balkán felé',
                'description' => '<p>Indulás a kora hajnali órákban, folyamatos utazás Szerbián keresztül rövid pihenőkkel. A késő esti órákban (21:00-22:00 között) érkezés Ulcinj környéki szállásunkra.</p>',
                'icon' => 'bus',
                'experience_type' => 'Utazás',
                'badges' => ['Ulcinj', 'Érkezés'],
                'image_index' => 0,
            ],
            [
                'day_number' => 2,
                'title' => 'Shkodër: fakultatív albán városnézés',
                'description' => '<p>Szabadprogram, pihenés a tengerparton. Fakultatív programlehetőség Albániába: kirándulás Shkodër városába, városnézéssel. A kirándulás díja 18 euro / fő, minimum 25 fő esetén. Délután visszaérkezünk szállásunkra, majd szabadprogram és fürdési lehetőség következik.</p>',
                'icon' => 'landmark',
                'experience_type' => 'Városnézés',
                'badges' => ['Shkodër', 'Fakultatív'],
                'image_index' => 1,
            ],
            [
                'day_number' => 3,
                'title' => 'Tirana és Kruja: Albánia történelmi arca',
                'description' => '<p>Szabad program, pihenés a tengerparton. Fakultatív programlehetőség Albániába: kirándulás Tiranába, Albánia fővárosába, ahol a Szkander bég tér és a Nemzeti Történelmi Múzeum is szerepel a programban. Ezt követően Kruja városában Szkander bég várának megtekintésére is lehetőség nyílik. A kirándulás díja 30 euro / fő, minimum 25 fő esetén.</p>',
                'icon' => 'museum',
                'experience_type' => 'Kultúra',
                'badges' => ['Tirana', 'Kruja'],
                'image_index' => 3,
            ],
            [
                'day_number' => 4,
                'title' => 'Bar és Petrovac: montenegrói tengerpart és történelem',
                'description' => '<p>Szabad program, pihenés a tengerparton. Fakultatív programlehetőség Montenegróba: Bar látnivalóival ismerkedünk. Az óvárosban, Stari Barban található az ország egyik legrégebbi, több mint 2000 éves élő olajfája. Ezután Petrovacba látogatunk, ahol a velenceiek által épített Castello erőd és a 3. századból való mozaikok a legfontosabb emlékek. Városnézés, majd szabad program fürdési lehetőséggel. A program díja 18 euro / fő, minimum 25 fő esetén. Délután visszaérkezünk szállásunkra.</p>',
                'icon' => 'map-pin',
                'experience_type' => 'Tengerpart és város',
                'badges' => ['Bar', 'Petrovac'],
                'image_index' => 4,
            ],
            [
                'day_number' => 5,
                'title' => 'Kotor és Budva: UNESCO örökség és mediterrán hangulat',
                'description' => '<p>Szabad program, pihenés a tengerparton. Fakultatív programlehetőség Montenegróba: a mesés Kotor városába látogatunk, amely a Tengerészeti Múzeumnak és az UNESCO világörökségi óvárosnak is otthont ad. Ezután Budva következik, Montenegró egyik leghangulatosabb városa, kicsiny félszigetre épült óvárossal, hangulatos üzletekkel, éttermekkel és szabad programmal. Fürdési lehetőség is biztosított. A program díja 25 euro / fő, minimum 25 fő esetén.</p>',
                'icon' => 'camera',
                'experience_type' => 'Városnézés',
                'badges' => ['Kotor', 'Budva', 'UNESCO'],
                'image_index' => 5,
            ],
            [
                'day_number' => 6,
                'title' => 'Szabad program a montenegrói tengerparton',
                'description' => '<p>Szabad program, pihenés a tengerparton.</p>',
                'icon' => 'beach',
                'experience_type' => 'Pihenés',
                'badges' => ['Tengerpart', 'Szabadidő'],
                'image_index' => 6,
            ],
            [
                'day_number' => 7,
                'title' => 'Hazautazás',
                'description' => '<p>A szállások elhagyása a reggeli órákban. Hazaindulás, folyamatos utazás rövid pihenőkkel, érkezés Magyarországra a késő éjjeli órákban.</p>',
                'icon' => 'bus',
                'experience_type' => 'Utazás',
                'badges' => ['Hazautazás'],
                'image_index' => 7,
            ],
        ];

        $tourAttributes = [
            'sort_order' => 7,
            'active' => true,
            'featured' => true,
            'recommended' => false,
            'partner_offer' => false,
            'image_offer' => true,
            'xml_enabled' => false,
            'slider_image_enabled' => true,
            'slider_text_enabled' => false,
            'name' => 'Montenegrói üdülés, Albánia kincseivel fűszerezve',
            'seo_name' => 'montenegro-albania-kincseivel-fuszerezve',
            'seo_auto_generate' => false,
            'action1' => 'Kotor-Budva-Bar-Petrovac-Kruja-Rozafa',
            'action2' => 'Autóbuszos körutazás Montenegró és Albánia érintésével',
            'list_description' => 'Montenegrói tengerparti üdülés Ulcinj környékén, fakultatív kirándulásokkal Shkodërbe, Tiranába, Krujába, Barba, Petrovacba, Kotorba és Budvába.',
            'short_description' => 'Montenegrói tengerpart, albán és montenegrói városnézések, reggelis hotel elhelyezés és buszos utazás egy 7 napos balkáni körúton.',
            'program_pdf_path' => null,
            'program_pdf_file' => null,
            'slider_image' => null,
            'program_before' => '<p>Montenegrói üdülés Ulcinj környékén, amelyet fakultatív albán és montenegrói kirándulások fűszereznek: Shkodër, Tirana, Kruja, Bar, Petrovac, Kotor és Budva is szerepel a kínálatban.</p>',
            'program' => '<p><strong>Útvonal:</strong> Kotor - Budva - Bar - Petrovac - Kruja - Rozafa.</p>',
            'inclusions' => '<p><strong>Csatlakozási lehetőségek:</strong> Miskolc, Mezőkövesd, Gyöngyös, Hatvan, Budapest, Kecskemét, Kiskunfélegyháza, Szeged.</p><p><strong>Útiokmány:</strong> Albánia és Montenegró utazáshoz kártyás személyi igazolvány szükséges.</p><p><a href="https://konzinfo.mfa.gov.hu/utazasi-tanacsok-orszagonkent/albania">Konzuli tájékoztató: Albánia</a><br /><a href="https://konzinfo.mfa.gov.hu/utazasi-tanacsok-orszagonkent/montenegro">Konzuli tájékoztató: Montenegró</a><br /><a href="https://konzinfo.mfa.gov.hu/utazasi-tanacsok-orszagonkent/szerbia">Konzuli tájékoztató: Szerbia</a></p>',
            'payment_program' => '<p><strong>Fakultatív programok:</strong></p><ul><li>Shkodër városnézés: 18 euro / fő (min. 25 fő esetén)</li><li>Tirana - Kruja kirándulás: 30 euro / fő (min. 25 fő esetén)</li><li>Bar - Petrovac kirándulás: 18 euro / fő (min. 25 fő esetén)</li><li>Kotor - Budva kirándulás: 25 euro / fő (min. 25 fő esetén)</li></ul><p>A fakultatív programok után visszaérkezés a szálláshelyre, illetve több állomásnál városnézés és fürdési lehetőség is szerepel.</p>',
            'prices' => '<p><strong>Részvételi díj:</strong> 189.900 Ft / fő.</p><p><strong>Milyen további költségek merülhetnek fel?</strong></p><ul><li>Üdülőhelyi illeték: 3.800 Ft / fő</li><li>Vacsora 6 alkalommal: 37.500 Ft / fő (igény szerint)</li><li>Egyágyas felár: 66.000 Ft / fő</li><li>Betegség-, baleset- és poggyászbiztosítás: 540 Ft / fő / nap</li><li>Útlemondási biztosítás: a részvételi díj 2,8%-a</li></ul>',
            'discounts' => null,
            'notes' => json_encode([
                'transport' => 'bus',
                'accommodation' => 'Hotel***',
                'hotel' => 'Hotel***',
                'meals' => 'reggeli',
                'country' => 'Montenegró, Albánia',
                'duration' => '7 nap / 6 éj',
                'departureDateLabel' => '2026.09.07. - 2026.09.13.',
                'additionalDates' => false,
                'badge' => 'Balkán',
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'gallery_title' => 'Galéria',
            'gallery_subtitle' => 'Montenegrói öblök, óvárosok és albán kirándulások képekben.',
            'region_id' => $region->id,
            'group_id' => $group->seo_name,
            'seasonal_group_id' => $seasonalGroup->seo_name,
            'fit_id' => null,
            'program_type_id' => 'classic-tour',
            'travel_mode_id' => 'bus',
            'difficulty_id' => 'easy',
            'country_ids' => ['me', 'al'],
            'tag_ids' => $tagIds,
            'category_ids' => $categoryIds,
            'price' => 189900,
            'price_box_price' => 189900,
            'price_box_displayed_price' => '189.900 Ft/fő-től',
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
            'displayed_price' => '189.900 Ft/fő-től',
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
                'montenegro-albania-program-day-'.($index + 1).'.'.pathinfo($gallerySource['file_name'], PATHINFO_EXTENSION),
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
            ['type' => 'included', 'text' => '6 éj szállás hotel***'],
            ['type' => 'included', 'text' => '6 reggeli'],
            ['type' => 'included', 'text' => 'Idegenvezetés'],
            ['type' => 'excluded', 'text' => 'Üdülőhelyi illeték: 3.800 Ft / fő'],
            ['type' => 'excluded', 'text' => 'Vacsora 6 alkalommal: 37.500 Ft / fő (igény szerint)'],
            ['type' => 'excluded', 'text' => 'Egyágyas felár: 66.000 Ft / fő'],
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

        $tour->dates()->create([
            'start_date' => '2026-09-07',
            'end_date' => '2026-09-13',
            'price' => 189900,
            'price_box_price' => 189900,
            'price_box_displayed_price' => '189.900 Ft/fő-től',
            'price_box_discount_badge' => null,
            'price_box_min_participants' => null,
            'price_box_max_participants' => null,
            'price_box_available_seats' => null,
            'price_box_capacity' => null,
            'status' => 'available',
        ]);
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
