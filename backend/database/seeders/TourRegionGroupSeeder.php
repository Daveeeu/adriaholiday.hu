<?php

namespace Database\Seeders;

use App\Models\Gallery;
use App\Models\TourRegionGroup;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TourRegionGroupSeeder extends Seeder
{
    public function run(): void
    {
        $galleries = Gallery::query()->orderBy('id')->get()->values();
        $groups = [
            ['name' => 'Bibione és Veneto', 'type' => 'region', 'seo' => 'bibione-veneto'],
            ['name' => 'Lignano és Friuli', 'type' => 'region', 'seo' => 'lignano-friuli'],
            ['name' => 'Caorle és Jesolo', 'type' => 'group', 'seo' => 'caorle-jesolo'],
            ['name' => 'Sarti és Halkidiki', 'type' => 'region', 'seo' => 'sarti-halkidiki'],
            ['name' => 'Nei Pori és Olympus', 'type' => 'group', 'seo' => 'nei-pori-olympus'],
            ['name' => 'Paralia és Riviera', 'type' => 'theme', 'seo' => 'paralia-riviera'],
            ['name' => 'Budva és Adriatika', 'type' => 'region', 'seo' => 'budva-adriatika'],
            ['name' => 'Horvát Riviéra', 'type' => 'group', 'seo' => 'horvat-riviera'],
            ['name' => 'Naposparti pihenés', 'type' => 'theme', 'seo' => 'naposparti-pihenes'],
            ['name' => 'Olasz tengerparti kedvencek', 'type' => 'region', 'seo' => 'olasz-tengerparti-kedvencek'],
        ];

        foreach ($groups as $index => $groupData) {
            TourRegionGroup::query()->updateOrCreate(
                ['seo_name' => $groupData['seo']],
                [
                    'active' => true,
                    'featured_on_homepage' => $index < 3,
                    'type' => $groupData['type'],
                    'name' => $groupData['name'],
                    'seo_auto_generate' => true,
                    'gallery_id' => $galleries->isNotEmpty() ? $galleries[$index % $galleries->count()]->id : null,
                    'description' => $groupData['name'].' bemutató szöveg.',
                    'list_below_text' => $groupData['name'].' alatt megjelenő kiegészítő szöveg.',
                    'travel_conditions_link' => '/utazas-feltetelek/'.$groupData['seo'],
                ],
            );
        }
    }
}
