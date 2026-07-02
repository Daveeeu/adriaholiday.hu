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

class BruggeLondonParizsTourSeeder extends Seeder
{
    public function run(): void
    {
        $region = Region::query()->where('slug', 'france')->first();

        if (! $region) {
            return;
        }

        $this->ensureReferenceOption('country', 'be', 'Belgium', 11);
        $this->ensureReferenceOption('country', 'gb', 'Egyesült Királyság', 12);
        $this->ensureReferenceOption('country', 'fr', 'Franciaország', 13);
        $this->ensureReferenceOption('travel-mode', 'bus', 'Busz', 1);
        $this->ensureReferenceOption('program-type', 'classic-tour', 'Klasszikus körút', 1);
        $this->ensureReferenceOption('difficulty', 'medium', 'Közepes', 2);

        $group = $this->ensureRegionGroup();
        $seasonalGroup = TourSeasonalGroup::query()->updateOrCreate(
            ['seo_name' => 'oszi-utazasok'],
            [
                'active' => true,
                'menu_type' => 'travel',
                'name' => 'Őszi utazások',
                'seo_auto_generate' => true,
                'box_text' => 'Őszi városlátogatások és körutazások.',
                'has_offers' => true,
            ],
        );

        $categoryIds = array_values(array_filter([
            $this->ensureCategory('Körutazások', 'korutazasok'),
            $this->ensureCategory('Körutazás'),
            $this->ensureCategory('Buszos körutazás'),
            $this->ensureCategory('Városlátogatás'),
        ]));

        $tagIds = array_values(array_filter([
            $this->ensureTag('Belgium'),
            $this->ensureTag('London'),
            $this->ensureTag('Párizs'),
            $this->ensureTag('Nyugat-Európa'),
            $this->ensureTag('Városnézés'),
            $this->ensureTag('Természet'),
            $this->ensureTag('Kultúra'),
        ]));

        $departurePlaceIds = collect([
            'Miskolc',
            'Mezőkövesd',
            'Gyöngyös',
            'Hatvan',
            'Budapest',
            'Tatabánya',
            'Győr',
            'Mosonmagyaróvár',
        ])->map(fn (string $name): int => $this->ensureDeparturePlace($name)->id)->all();

        $galleryItems = [
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/148473_587f30e111ee3/5a8d970e6fa085.14241756.jpg&op=;1200x800;',
                'file_name' => 'brugge-london-parizs-gallery-1.jpg',
                'title' => 'Brugge csatornái',
                'alt' => 'Brugge történelmi belvárosa és csatornái',
                'caption' => 'Brugge, Flandria gyöngyszeme',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/148473_587f30e111ee3/66e95e7614d0e8.00823523.jpg&op=;1200x800;',
                'file_name' => 'brugge-london-parizs-gallery-2.jpg',
                'title' => 'Útvonal térkép',
                'alt' => 'Brugge London Párizs körutazás térképe',
                'caption' => 'Brugge, London és Párizs útvonala',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/148473_587f30e111ee3/6166c202534d58.38847650.jpg&op=;1200x800;',
                'file_name' => 'brugge-london-parizs-gallery-3.jpg',
                'title' => 'London panoráma',
                'alt' => 'Londoni városkép',
                'caption' => 'A brit főváros ikonikus látképe',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/148473_587f30e111ee3/6166c202509187.95584090.jpg&op=;1200x800;',
                'file_name' => 'brugge-london-parizs-gallery-4.jpg',
                'title' => 'London utcái',
                'alt' => 'Belvárosi londoni hangulat',
                'caption' => 'Városnézés London szívében',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/148473_587f30e111ee3/6166c26873e652.31541414.jpg&op=;1200x800;',
                'file_name' => 'brugge-london-parizs-gallery-5.jpg',
                'title' => 'Tower Bridge',
                'alt' => 'Tower Bridge Londonban',
                'caption' => 'London egyik legismertebb jelképe',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/148473_587f30e111ee3/5a8d97485bb054.42600995.jpg&op=;1200x800;',
                'file_name' => 'brugge-london-parizs-gallery-6.jpg',
                'title' => 'Párizsi hangulat',
                'alt' => 'Párizs városképe',
                'caption' => 'Francia fővárosi városnézés',
            ],
            [
                'url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/148473_587f30e111ee3/6166c268734040.20864273.jpg&op=;1200x800;',
                'file_name' => 'brugge-london-parizs-gallery-7.jpg',
                'title' => 'Párizs panoráma',
                'alt' => 'Párizsi panoráma és Eiffel-torony környéke',
                'caption' => 'A körút zárása Párizsban',
            ],
        ];

        $programDays = [
            [
                'day_number' => 1,
                'title' => 'Indulás, utazás Metz környékére',
                'description' => '<p>Indulás a hajnali órákban, folyamatos utazás rövid pihenőkkel, este tranzitszállás elfoglalása Metz környékén.</p>',
                'icon' => 'bus',
                'experience_type' => 'Utazás',
                'badges' => ['Metz', 'Tranzitszállás'],
                'image_index' => 1,
            ],
            [
                'day_number' => 2,
                'title' => 'Brugge és átkelés Angliába',
                'description' => '<p>Késő délelőtt ismerkedés Flandria gyöngyszemével, Brugge városával. A programban szerepel a Miasszonyunk-templom, az Igazságügyi Palota, a Városháza és a Szent Vér Kápolna is. Délután továbbutazás Calais kikötője felé, átkelés a La Manche csatornán, majd szállás Sheppey-szigetén.</p>',
                'icon' => 'landmark',
                'experience_type' => 'Városnézés',
                'badges' => ['Brugge', 'Calais'],
                'image_index' => 0,
            ],
            [
                'day_number' => 3,
                'title' => 'London és Greenwich',
                'description' => '<p>Egész napos városnézés London szívében: London Eye, Big Ben, Parlament, Westminster Apátság, St James Park, Buckingham-palota, Downing Street 10, Whitehall, Trafalgar tér és Nelson-oszlopa. Délután Greenwichbe látogatunk, ahol a meridiánnál a keleti és nyugati félteke találkozási pontját tekintjük meg.</p>',
                'icon' => 'map-pin',
                'experience_type' => 'Városnézés',
                'badges' => ['London', 'Greenwich'],
                'image_index' => 2,
            ],
            [
                'day_number' => 4,
                'title' => 'London klasszikus látnivalói',
                'description' => '<p>A londoni városnézés folytatása: délelőtt lehetőség Madame Tussauds panoptikumának megtekintésére, majd a British Museum következik. Később séta az Oxford Streeten, a Sohóban és a Piccadilly Circus környékén.</p>',
                'icon' => 'museum',
                'experience_type' => 'Kultúra',
                'badges' => ['British Museum', 'Oxford Street'],
                'image_index' => 3,
            ],
            [
                'day_number' => 5,
                'title' => 'Tower of London és múzeumok',
                'description' => '<p>Városnézés Londonban: délelőtt a Tower of London és a Koronázási Ékszerek megtekintése, majd séta a Tower Bridge-en. Délután a Natural History Museum vagy a Science Museum felkeresése szerepel a programban.</p>',
                'icon' => 'camera',
                'experience_type' => 'Történelem',
                'badges' => ['Tower of London', 'Tower Bridge'],
                'image_index' => 4,
            ],
            [
                'day_number' => 6,
                'title' => 'Párizs első felfedezése',
                'description' => '<p>Délelőtt búcsút intünk Angliának, és átkelünk a kontinensre. Délután ismerkedés Párizs látnivalóival: Sacré-Cœur-bazilika, Montmartre és a Moulin Rouge környéke. Este szállás elfoglalása Párizs környékén.</p>',
                'icon' => 'landmark',
                'experience_type' => 'Városnézés',
                'badges' => ['Párizs', 'Montmartre'],
                'image_index' => 5,
            ],
            [
                'day_number' => 7,
                'title' => 'Párizsi gyalogos városnézés',
                'description' => '<p>Gyalogos városnézés Párizsban: Concorde tér, Champs-Élysées, Diadalív, Louvre, Invalidusok Dómja, sétahajózás a Szajnán és az Eiffel-torony megtekintése. Késő délután elköszönünk Párizstól, késő este tranzitszállás Metz környékén.</p>',
                'icon' => 'sparkles',
                'experience_type' => 'Városnézés',
                'badges' => ['Eiffel-torony', 'Szajna'],
                'image_index' => 6,
            ],
            [
                'day_number' => 8,
                'title' => 'Hazautazás',
                'description' => '<p>Kora reggel hazaindulunk, folyamatos utazás rövid pihenőkkel. Hazaérkezés a késő esti órákban.</p>',
                'icon' => 'bus',
                'experience_type' => 'Utazás',
                'badges' => ['Hazautazás'],
                'image_index' => 1,
            ],
        ];

        $tourAttributes = [
            'sort_order' => 8,
            'active' => true,
            'featured' => true,
            'recommended' => false,
            'partner_offer' => false,
            'image_offer' => true,
            'xml_enabled' => false,
            'slider_image_enabled' => true,
            'slider_text_enabled' => false,
            'name' => 'Brugge - London - Párizs',
            'seo_name' => 'brugge---london---parizs-2018',
            'seo_auto_generate' => false,
            'action1' => 'Brugge - Calais - London - Greenwich - Párizs - Metz',
            'action2' => 'Autóbuszos nyugat-európai körutazás',
            'list_description' => 'Nyugat-európai körutazás Brugge történelmi városával, több napos londoni városnézéssel és párizsi zárással, autóbusszal.',
            'short_description' => 'Brugge, London és Párizs ikonikus látnivalói egy 8 napos, buszos körutazásban, önellátásos és hoteles elhelyezéssel.',
            'program_pdf_path' => null,
            'program_pdf_file' => null,
            'slider_image' => null,
            'program_before' => '<p>Brugge, London és Párizs klasszikus látnivalóit fűzi fel ez a 8 napos nyugat-európai körút, tranzitszállásokkal, londoni városnézéssel és párizsi zárónappal.</p>',
            'program' => '<p><strong>Útvonal:</strong> Metz - Brugge - Calais - London - Greenwich - Párizs - Metz.</p>',
            'inclusions' => '<p><strong>Csatlakozási lehetőségek:</strong> Miskolc, Mezőkövesd, Gyöngyös, Hatvan, Budapest, Tatabánya, Győr, Mosonmagyaróvár.</p><p><strong>Útiokmány:</strong> Az utazáshoz útlevél és beutazási vízum szükséges.</p>',
            'payment_program' => '<p><strong>Belépőjegyek:</strong></p><p>Az árak tájékoztató jellegűek, egyéni árak, csoportkedvezmények várhatóak.</p><ul><li><strong>Westminster apátság:</strong> felnőtt 30 GBP, gyerek (6-17 év) 13 GBP</li><li><strong>Tower of London:</strong> felnőtt 35,8 GBP, gyerek (5-15 év) 17,9 GBP</li><li><strong>Greenwich:</strong> felnőtt 24 GBP / fő, gyerek 12 GBP / fő</li><li><strong>Madame Tussauds:</strong> 42 GBP / fő</li><li><strong>London Eye:</strong> 42 GBP / fő</li><li><strong>London Eye és Madame Tussauds kombinált jegy:</strong> felnőtt 51 GBP / fő (25.500 Ft / fő), gyerek 46 GBP / fő (23.000 Ft / fő)</li><li><strong>Eiffel-torony 3. emelet:</strong> felnőtt 36,1 EUR / fő, gyerek 18,1 EUR / fő</li></ul>',
            'prices' => '<p><strong>Részvételi díj:</strong> 273.600 Ft / fő.</p><p><strong>Milyen további költségek merülhetnek fel?</strong></p><ul><li>Betegség-, baleset- és poggyászbiztosítás: 540 Ft / fő / nap</li><li>Útlemondási biztosítás: a részvételi díj 2,8%-a</li></ul>',
            'discounts' => null,
            'notes' => json_encode([
                'transport' => 'bus',
                'accommodation' => '4 éj holiday home, 3 éj hotel*/**',
                'hotel' => 'Holiday home + hotel*/**',
                'meals' => 'önellátás',
                'country' => 'Belgium, Egyesült Királyság, Franciaország',
                'duration' => '8 nap / 7 éj',
                'departureDateLabel' => '2026.09.20. - 2026.09.27.',
                'additionalDates' => false,
                'badge' => 'Nyugat-Európa',
            ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            'gallery_title' => 'Galéria',
            'gallery_subtitle' => 'Brugge, London és Párizs városképei egy nyugat-európai körúton.',
            'region_id' => $region->id,
            'group_id' => $group->seo_name,
            'seasonal_group_id' => $seasonalGroup->seo_name,
            'fit_id' => null,
            'program_type_id' => 'classic-tour',
            'travel_mode_id' => 'bus',
            'difficulty_id' => 'medium',
            'country_ids' => ['be', 'gb', 'fr'],
            'tag_ids' => $tagIds,
            'category_ids' => $categoryIds,
            'price' => 273600,
            'price_box_price' => 273600,
            'price_box_displayed_price' => '273.600,-Ft/fő-től',
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
            'displayed_price' => '273.600,-Ft/fő-től',
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
                'brugge-london-parizs-program-day-'.($index + 1).'.'.pathinfo($gallerySource['file_name'], PATHINFO_EXTENSION),
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
            ['type' => 'included', 'text' => '3 éj szállás hotel**'],
            ['type' => 'included', 'text' => '4 éj szállás holiday home'],
            ['type' => 'included', 'text' => 'Idegenvezetés'],
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
            'start_date' => '2026-09-20',
            'end_date' => '2026-09-27',
            'price' => 273600,
            'price_box_price' => 273600,
            'price_box_displayed_price' => '273.600,-Ft/fő-től',
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
            ['seo_name' => 'nyugat-europai-korutak'],
            [
                'active' => true,
                'featured_on_homepage' => false,
                'type' => 'group',
                'name' => 'Nyugat-európai körutak',
                'seo_auto_generate' => true,
                'gallery_id' => Gallery::query()->value('id'),
                'description' => 'Buszos és városlátogatós nyugat-európai körutazások.',
                'list_below_text' => 'Brugge, London és Párizs klasszikus látnivalói egy útban.',
                'travel_conditions_link' => '/utazas-feltetelek/nyugat-europai-korutak',
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
