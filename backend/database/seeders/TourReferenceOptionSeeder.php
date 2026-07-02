<?php

namespace Database\Seeders;

use App\Models\TourReferenceOption;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class TourReferenceOptionSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            'country' => [
                ['code' => 'al', 'name' => 'Albánia'],
                ['code' => 'at', 'name' => 'Ausztria'],
                ['code' => 'ro', 'name' => 'Románia'],
                ['code' => 'hu', 'name' => 'Magyarország'],
                ['code' => 'hr', 'name' => 'Horvátország'],
                ['code' => 'it', 'name' => 'Olaszország'],
                ['code' => 'gr', 'name' => 'Görögország'],
                ['code' => 'bg', 'name' => 'Bulgária'],
                ['code' => 'me', 'name' => 'Montenegró'],
                ['code' => 'mk', 'name' => 'Észak-Macedónia'],
                ['code' => 'be', 'name' => 'Belgium'],
                ['code' => 'gb', 'name' => 'Egyesült Királyság'],
                ['code' => 'fr', 'name' => 'Franciaország'],
            ],
            'fit' => [
                ['code' => 'fit-1', 'name' => 'FIT'],
                ['code' => 'fit-2', 'name' => 'FIT Premium'],
                ['code' => 'fit-3', 'name' => 'FIT Select'],
            ],
            'program-type' => [
                ['code' => 'classic-tour', 'name' => 'Klasszikus körút'],
                ['code' => 'city-break', 'name' => 'City break'],
                ['code' => 'road-trip', 'name' => 'Road trip'],
            ],
            'travel-mode' => [
                ['code' => 'bus', 'name' => 'Busz'],
                ['code' => 'plane', 'name' => 'Repülő'],
                ['code' => 'train', 'name' => 'Vonat'],
            ],
            'difficulty' => [
                ['code' => 'easy', 'name' => 'Könnyű'],
                ['code' => 'medium', 'name' => 'Közepes'],
                ['code' => 'hard', 'name' => 'Nehéz'],
            ],
        ];

        foreach ($items as $type => $options) {
            foreach ($options as $index => $option) {
                TourReferenceOption::query()->updateOrCreate(
                    ['type' => $type, 'code' => $option['code']],
                    [
                        'name' => $option['name'],
                        'active' => true,
                        'sort_order' => $index + 1,
                    ],
                );
            }
        }
    }
}
