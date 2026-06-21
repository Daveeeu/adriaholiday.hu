<?php

namespace Database\Seeders;

use App\Models\TourDeparturePlace;
use Illuminate\Database\Seeder;

class TourDeparturePlaceSeeder extends Seeder
{
    public function run(): void
    {
        $places = [
            'Budapest', 'Győr', 'Székesfehérvár', 'Veszprém', 'Siófok',
            'Kaposvár', 'Pécs', 'Szeged', 'Kecskemét', 'Debrecen',
            'Miskolc', 'Nyíregyháza', 'Tatabánya', 'Szombathely', 'Zalaegerszeg',
            'Nagykanizsa', 'Baja', 'Szolnok', 'Eger', 'Salgótarján',
        ];

        foreach ($places as $index => $place) {
            TourDeparturePlace::query()->updateOrCreate(
                ['name' => $place, 'city' => $place],
                [
                    'active' => true,
                    'fee' => $index % 2 === 0 ? 10.00 + ($index * 2) : null,
                ],
            );
        }
    }
}
