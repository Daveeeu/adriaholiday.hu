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

class AlbaniaMacedoniaTourSeeder extends Seeder
{
    public function run(): void
    {
        $region = Region::query()->where('slug', 'albania')->first();

        if (! $region) {
            return;
        }

        $this->ensureReferenceOption('country', 'mk', 'Észak-Macedónia', 9);
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
            $this->ensureTag('Albánia'),
            $this->ensureTag('Balkán'),
            $this->ensureTag('Tengerpart'),
            $this->ensureTag('Városnézés'),
            $this->ensureTag('Természet'),
            $this->ensureTag('Meleg úti célok'),
            $this->ensureTag('Kultúra'),
            $this->ensureTag('Észak-Macedónia'),
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
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/16205_74121285244_5052/601278807aa297.72820162.jpg&op=;1200x800;',
                'file_name' => 'albania-macedonia-gallery-1.jpg',
                'title' => 'Albán városi hangulat',
                'alt' => 'Albán városi utcakép',
                'caption' => 'Mediterrán hangulat az út egyik állomásán',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/16205_74121285244_5052/66616543edb280.18340444.jpg&op=;1200x800;',
                'file_name' => 'albania-macedonia-gallery-2.jpg',
                'title' => 'Albánia útvonala',
                'alt' => 'Albánia térképes illusztráció',
                'caption' => 'A körutazás főbb állomásai',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/16205_74121285244_5052/601278807b1d96.03725330.jpg&op=;1200x800;',
                'file_name' => 'albania-macedonia-gallery-3.jpg',
                'title' => 'Albán Riviéra',
                'alt' => 'Albán tengerpart és türkizkék víz',
                'caption' => 'Pihenés az albán tengerparton',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/16205_74121285244_5052/601278807e1978.90753457.jpg&op=;1200x800;',
                'file_name' => 'albania-macedonia-gallery-4.jpg',
                'title' => 'Balkáni városkép',
                'alt' => 'Történelmi balkáni városrész',
                'caption' => 'Kulturális megállók a körút során',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/16205_74121285244_5052/601278807d42b2.32726166.jpg&op=;1200x800;',
                'file_name' => 'albania-macedonia-gallery-5.jpg',
                'title' => 'Belvárosi részlet',
                'alt' => 'Színes balkáni belvárosi részlet',
                'caption' => 'Városnézés és séták a programban',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/16205_74121285244_5052/601278807c60a8.98545663.jpg&op=;1200x800;',
                'file_name' => 'albania-macedonia-gallery-6.jpg',
                'title' => 'Ohridi hangulat',
                'alt' => 'Színes ernyők és városi hangulat Ohrid térségében',
                'caption' => 'Hangulatos séták és fotótémák',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/16205_74121285244_5052/601278807ba427.03498027.jpg&op=;1200x800;',
                'file_name' => 'albania-macedonia-gallery-7.jpg',
                'title' => 'Történelmi örökség',
                'alt' => 'Történelmi látnivaló a körutazás útvonalán',
                'caption' => 'UNESCO és történelmi emlékhelyek',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/16205_74121285244_5052/5a8aa05d956170.66609098.jpg&op=;1200x800;',
                'file_name' => 'albania-macedonia-gallery-8.jpg',
                'title' => null,
                'alt' => 'Albánia Makedóniával fűszerezve galéria',
                'caption' => null,
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/16205_74121285244_5052/68cd3a8db9bf01.08326242.jpeg&op=;1200x800;',
                'file_name' => 'albania-macedonia-gallery-9.jpeg',
                'title' => null,
                'alt' => 'Albánia Makedóniával fűszerezve galéria',
                'caption' => null,
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/16205_74121285244_5052/68cd40663781d1.11582143.jpeg&op=;1200x800;',
                'file_name' => 'albania-macedonia-gallery-10.jpeg',
                'title' => null,
                'alt' => 'Albánia Makedóniával fűszerezve galéria',
                'caption' => null,
            ],
        ];

        $programDays = [
            [
                'day_number' => 1,
                'title' => 'Belgrád: világvárosi pezsgés a Duna és Száva ölelésében',
                'description' => '<p>Indulás a kora reggeli órákban, folyamatos utazás Szerbián keresztül rövid pihenőkkel. Útközben Belgrád látnivalóival ismerkedünk: Kalemegdan vára, séta a Knez Mihajlova sétálóutcán, majd szabad program. Szállás Szerbia térségében.</p>',
                'icon' => 'bus',
                'experience_type' => 'Utazás',
                'badges' => ['Belgrád', 'Városnézés'],
                'image_index' => 0,
            ],
            [
                'day_number' => 2,
                'title' => 'Shkodër: Albánia kapujában',
                'description' => '<p>Reggeli után elhagyjuk Szerbiát és megérkezünk Albániába. Délután Shkodër városában rövid sétát teszünk, megtekintjük a Szent István-székesegyházat és a Loro Borici Stadion környékét, majd az esti órákban elfoglaljuk a szállást Albánia egyik kellemes tengerparti városában. Vacsora.</p>',
                'icon' => 'landmark',
                'experience_type' => 'Kultúra',
                'badges' => ['Shkodër', 'Tengerpart'],
                'image_index' => 1,
            ],
            [
                'day_number' => 3,
                'title' => 'Durres és fakultatív Tirana',
                'description' => '<p>A napot pihenéssel kezdhetjük a tengerparton, vagy fakultatív kirándulással Albánia fővárosába, Tiranába indulunk. Séta a Szkander bég téren, a Nemzeti Történelmi Múzeum környékén, majd visszatérés a szállásra és vacsora. A fakultatív tiranai kirándulás díja 32 euro, minimum 25 fő esetén.</p>',
                'icon' => 'map-pin',
                'experience_type' => 'Városnézés',
                'badges' => ['Durres', 'Tirana'],
                'image_index' => 2,
            ],
            [
                'day_number' => 4,
                'title' => 'Durres: római örökség és mediterrán hangulat',
                'description' => '<p>Reggeli után Durres városnézés következik, ahol a római kori amfiteátrum a legfontosabb látnivaló. Délután szabadprogram, fürdés és napozás az albán homokos tengerparton. Vacsora a szálláson.</p>',
                'icon' => 'beach',
                'experience_type' => 'Pihenés',
                'badges' => ['Durres', 'Amfiteátrum'],
                'image_index' => 3,
            ],
            [
                'day_number' => 5,
                'title' => 'Berat: az ezer ablak városa',
                'description' => '<p>Reggeli után szabad program vagy fakultatív kirándulás Beratba. A UNESCO világörökségi város fő látnivalói a Kala fellegvár, az Ikon Múzeum, a katolikus templomok és az iszlám mecsetek, valamint az Osum folyópart épületei. A fakultatív berat-i kirándulás díja 40 euro, minimum 25 fő esetén.</p>',
                'icon' => 'museum',
                'experience_type' => 'Kultúra',
                'badges' => ['Berat', 'UNESCO'],
                'image_index' => 4,
            ],
            [
                'day_number' => 6,
                'title' => 'Ohridi-tó és Skopje: természet és történelem',
                'description' => '<p>Reggeli után búcsút veszünk az albán tengerparttól, és Macedónia felé indulunk. Rövid pihenőt tartunk az Ohridi-tónál, ahol csónakázási lehetőség és városnézés is vár, majd tovább utazunk Skopjéba rövid városnézésre. A szállást Makedóniában foglaljuk el.</p>',
                'icon' => 'camera',
                'experience_type' => 'Természet és város',
                'badges' => ['Ohrid', 'Skopje'],
                'image_index' => 5,
            ],
            [
                'day_number' => 7,
                'title' => 'Hazatérés',
                'description' => '<p>Reggeli után Szerbián keresztül indulunk vissza Magyarországra. Érkezés a késő esti órákban.</p>',
                'icon' => 'bus',
                'experience_type' => 'Utazás',
                'badges' => ['Hazautazás'],
                'image_index' => 6,
            ],
        ];

        $tourAttributes = [
            'sort_order' => 6,
            'active' => true,
            'featured' => true,
            'recommended' => false,
            'partner_offer' => false,
            'image_offer' => true,
            'xml_enabled' => false,
            'slider_image_enabled' => true,
            'slider_text_enabled' => false,
            'name' => 'Albania, a Balkán riviérája / Albánia Makedóniával fűszerezve',
            'seo_name' => 'albania-makedoniaval-fuszerezve',
            'seo_auto_generate' => false,
            'action1' => 'Belgrád - Shkodër - Durres - Tirana - Berat - Ohrid - Skopje',
            'action2' => 'Buszos körutazás Albániában és Észak-Macedóniában',
            'list_description' => 'Albánia egzotikus kultúrája, Durres homokos tengerpartja, Berat történelmi öröksége és az Ohridi-tó hangulata egy buszos körutazásban.',
            'short_description' => 'Albánia egzotikus kultúrája, Durres tengerpartja, Berat és Ohrid látnivalói, valamint skopjei kitérő egy buszos, félpanziós körutazásban.',
            'program_pdf_path' => null,
            'program_pdf_file' => null,
            'slider_image' => null,
            'program_before' => '<p>Belgrád, Shkodër, Durres, Tirana, Berat, Ohrid és Skopje állomásait fűzi össze ez a 7 napos buszos körutazás, amelyben a tengerparti pihenés és a balkáni városnézés egyszerre kap szerepet.</p>',
            'program' => '<p><strong>Útvonal:</strong> Belgrád - Shkodër - Durres - Tirana - Berat - Ohrid - Skopje.</p>',
            'inclusions' => '<p><strong>Csatlakozási lehetőségek:</strong> Miskolc, Mezőkövesd, Gyöngyös, Hatvan, Budapest, Kecskemét, Kiskunfélegyháza, Szeged.</p><p><strong>Útiokmány:</strong> Albánia és Montenegró utazáshoz kártyás személyi igazolvány szükséges.</p><p><a href="https://konzinfo.mfa.gov.hu/utazasi-tanacsok-orszagonkent/albania">Konzuli tájékoztató: Albánia</a><br /><a href="https://konzinfo.mfa.gov.hu/utazasi-tanacsok-orszagonkent/montenegro">Konzuli tájékoztató: Montenegró</a></p>',
            'payment_program' => '<p><strong>Fakultatív programok:</strong></p><ul><li>Tirana városlátogatás: 32 euro / fő (min. 25 fő esetén)</li><li>Berat kirándulás: 40 euro / fő (min. 25 fő esetén)</li><li>Kruja és Preza vára: 30 euro / fő</li></ul><p><strong>Belépőjegyek:</strong></p><table><thead><tr><th>Program</th><th>Felnőtt</th><th>Gyerek (12 év alatt)</th></tr></thead><tbody><tr><td>Belgrád vár</td><td>ingyenes</td><td>ingyenes</td></tr><tr><td>Belgrád vár - Bunker (min. 10 fő)</td><td>70 RSD / fő</td><td>70 RSD / fő</td></tr><tr><td>Belgrád vár - Kazamaták (min. 10 fő)</td><td>250 RSD / fő</td><td>250 RSD / fő</td></tr><tr><td>Belgrád vár - Torony (min. 10 fő)</td><td>56 RSD / fő</td><td>56 RSD / fő</td></tr><tr><td>Kruja vár</td><td>ingyenes</td><td>ingyenes</td></tr><tr><td>Kruja - Skenderbeg Múzeum (csoportos jegy)</td><td>400 albán LEK / fő</td><td>ingyenes</td></tr><tr><td>Kruja - Nemzeti Néprajzi Múzeum (csoportos jegy)</td><td>300 albán LEK / fő</td><td>ingyenes</td></tr><tr><td>Ohridi-tó csónakázás</td><td>5 Euro / fő</td><td>5 Euro / fő</td></tr><tr><td>Ardenicai kolostor</td><td>5 Euro / fő</td><td>5 Euro / fő</td></tr></tbody></table>',
            'prices' => '<p><strong>Részvételi díj:</strong> 269.600 Ft / fő.</p><p><strong>Milyen további költségek merülhetnek fel?</strong></p><ul><li>Üdülőhelyi illeték: 4.400 Ft / fő</li><li>Egyágyas felár</li><li>Fakultatív kirándulások</li><li>Belépők</li><li>Betegség-, baleset-, poggyászbiztosítás: 540 Ft / fő / nap</li><li>Útlemondási biztosítás: a részvételi díj 2,8%-a</li></ul>',
            'discounts' => null,
            'notes' => json_encode([
                'transport' => 'bus',
                'accommodation' => 'Hotel***',
                'hotel' => 'Hotel***',
                'meals' => 'félpanzió',
                'country' => 'Albánia, Észak-Macedónia',
                'duration' => '7 nap / 6 éj',
                'departureDateLabel' => '2026.09.25. - 2026.10.01.',
                'additionalDates' => false,
                'badge' => 'Balkán',
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'gallery_title' => 'Galéria',
            'gallery_subtitle' => 'Városnézés, tengerpart és balkáni hangulat egy útban.',
            'region_id' => $region->id,
            'group_id' => $group->seo_name,
            'seasonal_group_id' => $seasonalGroup->seo_name,
            'fit_id' => null,
            'program_type_id' => 'classic-tour',
            'travel_mode_id' => 'bus',
            'difficulty_id' => 'easy',
            'country_ids' => ['al', 'mk'],
            'tag_ids' => $tagIds,
            'category_ids' => $categoryIds,
            'price' => 269600,
            'price_box_price' => 269600,
            'price_box_displayed_price' => '269.600,-Ft/fő-től',
            'price_box_currency' => 'HUF',
            'price_box_price_suffix' => null,
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
            'displayed_price' => '269.600,-Ft/fő-től',
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
                'albania-macedonia-program-day-'.($index + 1).'.'.pathinfo($gallerySource['file_name'], PATHINFO_EXTENSION),
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
            ['type' => 'included', 'text' => 'Autóbuszközlekedés'],
            ['type' => 'included', 'text' => '6 éj szállás Hotel***'],
            ['type' => 'included', 'text' => '6 reggeli, vacsora'],
            ['type' => 'included', 'text' => 'Idegenvezetés'],
            ['type' => 'excluded', 'text' => 'Üdülőhelyi illeték: 4.400 Ft / fő'],
            ['type' => 'excluded', 'text' => 'Egyágyas felár'],
            ['type' => 'excluded', 'text' => 'Fakultatív kirándulások'],
            ['type' => 'excluded', 'text' => 'Belépők'],
            ['type' => 'excluded', 'text' => 'Betegség-, baleset-, poggyászbiztosítás: 540 Ft / fő / nap'],
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
            'start_date' => '2026-09-25',
            'end_date' => '2026-10-01',
            'price' => 269600,
            'price_box_price' => 269600,
            'price_box_displayed_price' => '269.600,-Ft/fő-től',
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
                'description' => 'Balkáni körutazások Albániától Észak-Macedóniáig.',
                'list_below_text' => 'Körutazások tengerparti és kulturális megállókkal a Balkánon.',
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
