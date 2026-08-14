<?php

namespace Database\Seeders;

use App\Models\Location;
use App\Models\Region;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $locations = [
            ['region' => 'italy', 'slug' => 'bibione', 'name' => 'Bibione', 'type' => 'coastal_town'],
            ['region' => 'italy', 'slug' => 'lignano', 'name' => 'Lignano', 'type' => 'coastal_town'],
            ['region' => 'italy', 'slug' => 'caorle', 'name' => 'Caorle', 'type' => 'coastal_town'],
            ['region' => 'italy', 'slug' => 'jesolo', 'name' => 'Jesolo', 'type' => 'coastal_town'],
        ];

        foreach ($locations as $index => $data) {
            $region = Region::query()->where('slug', $data['region'])->firstOrFail();
            $sortOrder = $index + 1;

            Location::query()->updateOrCreate(
                [
                    'region_id' => $region->id,
                    'slug' => $data['slug'],
                ],
                [
                    'name' => $data['name'],
                    'type' => $data['type'],
                    'latitude' => 40 + ($index * 0.35),
                    'longitude' => 18 + ($index * 0.35),
                    'transfer_minutes_from_airport' => 20 + (($index % 5) * 7),
                    'description' => "{$data['name']} utazási célpont a {$region->name} régióban.",
                    'featured' => $data['slug'] === 'bibione',
                    'is_active' => true,
                    'sort_order' => $sortOrder,
                ],
            );
        }
    }
}
