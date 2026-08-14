<?php

namespace Database\Seeders;

use App\Models\ApartmentType;
use Illuminate\Database\Seeder;

class ApartmentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['slug' => 'italian', 'name' => 'Olasz apartmanok', 'is_active' => true, 'sort_order' => 1],
        ];

        foreach ($types as $type) {
            ApartmentType::query()->updateOrCreate(['slug' => $type['slug']], $type);
        }
    }
}
