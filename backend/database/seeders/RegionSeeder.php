<?php

namespace Database\Seeders;

use App\Models\Region;
use App\Support\MediaCategory;
use Database\Seeders\Concerns\SeedsMediaFromUrl;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    use SeedsMediaFromUrl;

    public function run(): void
    {
        $regions = [
            [
                'slug' => 'greece',
                'name' => 'Görögország',
                'country_code' => 'GR',
                'portfolio_image_url' => 'https://adriaholiday.hu/framework/img.php?p=files/sea-4768869_1920.jpg&op=;800x450;',
                'portfolio_short_description' => 'A görög tengerpartok és szigetek apartmanjai, családi és páros nyaralásokhoz.',
            ],
            [
                'slug' => 'bulgaria',
                'name' => 'Bulgária',
                'country_code' => 'BG',
                'portfolio_image_url' => 'https://adriaholiday.hu/framework/img.php?p=files/shutterstock_2495541347.jpg&op=;800x450;',
                'portfolio_short_description' => 'Kedvelt fekete-tengeri apartmanok, hosszú homokos partokkal és kényelmes árakkal.',
            ],
            [
                'slug' => 'montenegro',
                'name' => 'Montenegró',
                'country_code' => 'ME',
                'portfolio_image_url' => 'https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;800x450;',
                'portfolio_short_description' => 'Balkáni tengerparti apartmanok Budva, Petrovac és Ulcinj környékén.',
            ],
            [
                'slug' => 'croatia',
                'name' => 'Horvátország',
                'country_code' => 'HR',
                'portfolio_image_url' => 'https://adriaholiday.hu/framework/img.php?p=files/yellow-3521730_1920.jpg&op=;800x450;',
                'portfolio_short_description' => 'Adriai apartmanok Rovinjtól Makarskáig, változatos partszakaszokkal.',
            ],
            [
                'slug' => 'italy',
                'name' => 'Olaszország',
                'country_code' => 'IT',
                'portfolio_image_url' => 'https://adriaholiday.hu/framework/img.php?p=files/aeroplane-16749_1280.jpg&op=;800x450;',
                'portfolio_short_description' => 'Bibione, Lignano, Caorle és Jesolo apartmanjai a klasszikus olasz tengerparton.',
            ],
            [
                'slug' => 'austria',
                'name' => 'Ausztria',
                'country_code' => 'AT',
                'portfolio_image_url' => 'https://adriaholiday.hu/framework/img.php?p=files/yellow-3521730_1920.jpg&op=;800x450;',
                'portfolio_short_description' => 'Alpesi körutazások, városnézés és hegyvidéki élmények Ausztriában.',
            ],
            [
                'slug' => 'france',
                'name' => 'Franciaország',
                'country_code' => 'FR',
                'portfolio_image_url' => 'https://adriaholiday.hu/framework/img.php?p=uploads/gallery/148473_587f30e111ee3/6166c268734040.20864273.jpg&op=;800x450;',
                'portfolio_short_description' => 'Nyugat-európai körutazások Párizs, London és Brugge városélményeivel.',
            ],
            [
                'slug' => 'romania',
                'name' => 'Románia',
                'country_code' => 'RO',
                'portfolio_image_url' => 'https://adriaholiday.hu/framework/img.php?p=files/bosnia-4683579_1920.jpg&op=;800x450;',
                'portfolio_short_description' => 'Erdélyi és dunai körutazások Románia különleges tájain.',
            ],
            [
                'slug' => 'albania',
                'name' => 'Albánia',
                'country_code' => 'AL',
                'portfolio_image_url' => 'https://adriaholiday.hu/framework/img.php?p=files/sea-4768869_1920.jpg&op=;800x450;',
                'portfolio_short_description' => 'Adriai és balkáni utazások Albánia tengerparti és kulturális helyszíneivel.',
            ],
        ];

        foreach ($regions as $index => $data) {
            $region = Region::query()->updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'country_code' => $data['country_code'],
                    'timezone' => 'Europe/Budapest',
                    'currency' => 'EUR',
                    'hero_image_url' => $data['portfolio_image_url'],
                    'summary' => $data['portfolio_short_description'],
                    'description' => $data['portfolio_short_description'],
                    'is_active' => true,
                    'sort_order' => $index + 1,
                    'portfolio_featured' => $index < 4,
                    'portfolio_sort_order' => $index + 1,
                    'portfolio_image_url' => $data['portfolio_image_url'],
                    'portfolio_short_description' => $data['portfolio_short_description'],
                ],
            );

            $region->clearMediaCollection('portfolio-image');
            $this->attachMediaFromUrl(
                $region,
                'portfolio-image',
                $data['portfolio_image_url'],
                $data['slug'].'.jpg',
                $data['name'],
                [
                    'category' => MediaCategory::APARTMENTS->value,
                    'source_context' => 'region',
                    'source_id' => $region->id,
                    'alt' => $data['name'],
                    'title' => $data['name'],
                ],
            );
        }
    }
}
