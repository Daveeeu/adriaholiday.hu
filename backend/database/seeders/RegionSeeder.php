<?php

namespace Database\Seeders;

use App\Models\Region;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    public function run(): void
    {
        $regions = [
            ['slug' => 'greece', 'name' => 'Görögország', 'country_code' => 'GR', 'currency' => 'EUR'],
            ['slug' => 'bulgaria', 'name' => 'Bulgária', 'country_code' => 'BG', 'currency' => 'EUR'],
            ['slug' => 'montenegro', 'name' => 'Montenegró', 'country_code' => 'ME', 'currency' => 'EUR'],
            ['slug' => 'croatia', 'name' => 'Horvátország', 'country_code' => 'HR', 'currency' => 'EUR'],
            ['slug' => 'italy', 'name' => 'Olaszország', 'country_code' => 'IT', 'currency' => 'EUR'],
        ];

        foreach ($regions as $index => $data) {
            Region::query()->updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'name' => $data['name'],
                    'country_code' => $data['country_code'],
                    'timezone' => 'Europe/Budapest',
                    'currency' => $data['currency'],
                    'hero_image_url' => "https://picsum.photos/seed/region-{$index}/1280/720",
                    'summary' => "{$data['name']} kiemelt utazási régió.",
                    'description' => "{$data['name']} az admin demo adatkészlet része.",
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ],
            );
        }
    }
}
