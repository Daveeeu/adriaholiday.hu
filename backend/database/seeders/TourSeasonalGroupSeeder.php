<?php

namespace Database\Seeders;

use App\Models\TourSeasonalGroup;
use Illuminate\Database\Seeder;

class TourSeasonalGroupSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            ['seo' => 'tavaszi-kinalat', 'name' => 'Tavaszi kínálat', 'menu_type' => 'intro'],
            ['seo' => 'nyari-ajanlatok', 'name' => 'Nyári ajánlatok', 'menu_type' => 'featured'],
            ['seo' => 'oszi-utazasok', 'name' => 'Őszi utazások', 'menu_type' => 'travel'],
            ['seo' => 'elore-foglalas', 'name' => 'Előfoglalás', 'menu_type' => 'request'],
            ['seo' => 'csaladi-nyaralas', 'name' => 'Családi nyaralás', 'menu_type' => 'icon'],
            ['seo' => 'paros-utazas', 'name' => 'Páros utazás', 'menu_type' => 'featured'],
            ['seo' => 'osztalykirandulas', 'name' => 'Csoportos utak', 'menu_type' => 'travel'],
            ['seo' => 'last-minute', 'name' => 'Last minute', 'menu_type' => 'request'],
        ];

        foreach ($groups as $groupData) {
            TourSeasonalGroup::query()->updateOrCreate(
                ['seo_name' => $groupData['seo']],
                [
                    'active' => true,
                    'menu_type' => $groupData['menu_type'],
                    'name' => $groupData['name'],
                    'seo_auto_generate' => true,
                    'box_text' => $groupData['name'].' kiemelt ajánlatai.',
                    'has_offers' => true,
                ],
            );
        }
    }
}
