<?php

namespace Database\Seeders;

use App\Models\ApartmentType;
use Illuminate\Database\Seeder;

class ApartmentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['slug' => 'greek', 'name' => 'Görög apartmanok', 'is_active' => false, 'sort_order' => 1],
            ['slug' => 'bulgarian', 'name' => 'Bulgáriai apartmanok', 'is_active' => false, 'sort_order' => 2],
            ['slug' => 'montenegro', 'name' => 'Montenegrói apartmanok', 'is_active' => false, 'sort_order' => 3],
            ['slug' => 'croatian', 'name' => 'Horvát apartmanok', 'is_active' => false, 'sort_order' => 4],
            ['slug' => 'croatian_new', 'name' => 'Horvát apartmanok (új)', 'is_active' => false, 'sort_order' => 5],
            ['slug' => 'italian', 'name' => 'Olasz apartmanok', 'is_active' => true, 'sort_order' => 6],
        ];

        foreach ($types as $type) {
            ApartmentType::query()->updateOrCreate(['slug' => $type['slug']], $type);
        }
    }
}
