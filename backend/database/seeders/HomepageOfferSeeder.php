<?php

namespace Database\Seeders;

use App\Models\HomepageOffer;
use App\Support\MediaCategory;
use Database\Seeders\Concerns\SeedsMediaFromUrl;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class HomepageOfferSeeder extends Seeder
{
    use SeedsMediaFromUrl;

    public function run(): void
    {
        HomepageOffer::query()->withTrashed()->get()->each->forceDelete();

        $offers = [
            [
                'name' => 'Körutazások',
                'seo_name' => 'korutazasok',
                'link' => '/kategoriak/korutazasok',
                'image' => 'https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;800x450;',
                'short_description' => 'Válogatott buszos és repülős körutazások Európa legszebb tájaira.',
            ],
            [
                'name' => 'Repülős körutazások',
                'seo_name' => 'repulos-korutazasok',
                'link' => '/kategoriak/repulos-korutazasok',
                'image' => 'https://adriaholiday.hu/framework/img.php?p=files/aeroplane-16749_1280.jpg&op=;800x450;',
                'short_description' => 'Gyors, kényelmes repülős körutazások különleges úti célokra.',
            ],
            [
                'name' => 'Tengerparti ajánlatok autóbusszal',
                'seo_name' => 'tengerpart-busz',
                'link' => '/kategoriak/tengerpart-busz',
                'image' => 'https://adriaholiday.hu/framework/img.php?p=files/sea-4768869_1920.jpg&op=;800x450;',
                'short_description' => 'Buszos tengerparti üdülések remek ár-érték aránnyal.',
            ],
            [
                'name' => 'Tengerparti szállások Olaszországban',
                'seo_name' => 'olaszorszag',
                'link' => '/kategoriak/olaszorszag',
                'image' => 'https://adriaholiday.hu/framework/img.php?p=files/yellow-3521730_1920.jpg&op=;800x450;',
                'short_description' => 'Olasz tengerparti szállások széles választéka és jó ajánlatok.',
            ],
            [
                'name' => 'Különlegességek',
                'seo_name' => 'kulonlegessegek',
                'link' => '/kategoriak/kulonlegessegek',
                'image' => 'https://adriaholiday.hu/framework/img.php?p=files/shutterstock_2495541347.jpg&op=;800x450;',
                'short_description' => 'Különleges tematikus utak, ritkább úti célokkal és élményekkel.',
            ],
            [
                'name' => 'Egzotikus üdülések',
                'seo_name' => 'egzotikus',
                'link' => '/kategoriak/egzotikus',
                'image' => 'https://adriaholiday.hu/framework/img.php?p=files/trip-2203682_1920.jpg&op=;800x450;',
                'short_description' => 'Egzotikus úti célok, felejthetetlen pihenésekkel és programokkal.',
            ],
        ];

        foreach ($offers as $i => $data) {
            $offer = HomepageOffer::query()->updateOrCreate(
                ['sort_order' => $i + 1],
                [
                    'active' => true,
                    'image' => $data['image'],
                    'image_title' => $data['name'],
                    'link' => $data['link'],
                ],
            );

            $offer->clearMediaCollection('image');
            $this->attachMediaFromUrl(
                $offer,
                'image',
                $data['image'],
                Str::slug($data['name']).'.jpg',
                $data['name'],
                [
                    'category' => MediaCategory::HOMEPAGE_OFFERS->value,
                    'source_context' => 'homepage_offer',
                    'source_id' => $offer->id,
                    'alt' => $data['name'],
                    'title' => $data['name'],
                ],
            );

            $offer->translations()->updateOrCreate(
                ['locale' => 'hu'],
                [
                    'name' => $data['name'],
                    'seo_name' => $data['seo_name'],
                    'short_description' => $data['short_description'],
                ],
            );
            $offer->translations()->updateOrCreate(
                ['locale' => 'en'],
                [
                    'name' => $data['name'],
                    'seo_name' => $data['seo_name'],
                    'short_description' => $data['short_description'],
                ],
            );
            $offer->translations()->updateOrCreate(
                ['locale' => 'de'],
                [
                    'name' => $data['name'],
                    'seo_name' => $data['seo_name'],
                    'short_description' => $data['short_description'],
                ],
            );
        }
    }
}
