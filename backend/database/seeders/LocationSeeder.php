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
            ['region' => 'greece', 'slug' => 'sarti', 'name' => 'Sarti', 'type' => 'coastal_town'],
            ['region' => 'greece', 'slug' => 'nei-pori', 'name' => 'Nei Pori', 'type' => 'coastal_town'],
            ['region' => 'greece', 'slug' => 'paralia', 'name' => 'Paralia', 'type' => 'coastal_town'],
            ['region' => 'greece', 'slug' => 'hanioti', 'name' => 'Hanioti', 'type' => 'coastal_town'],
            ['region' => 'montenegro', 'slug' => 'budva', 'name' => 'Budva', 'type' => 'coastal_town'],
            ['region' => 'montenegro', 'slug' => 'petrovac', 'name' => 'Petrovac', 'type' => 'coastal_town'],
            ['region' => 'montenegro', 'slug' => 'ulcinj', 'name' => 'Ulcinj', 'type' => 'coastal_town'],
            ['region' => 'montenegro', 'slug' => 'bar', 'name' => 'Bar', 'type' => 'coastal_town'],
            ['region' => 'croatia', 'slug' => 'rovinj', 'name' => 'Rovinj', 'type' => 'coastal_town'],
            ['region' => 'croatia', 'slug' => 'porec', 'name' => 'Poreč', 'type' => 'coastal_town'],
            ['region' => 'croatia', 'slug' => 'crikvenica', 'name' => 'Crikvenica', 'type' => 'coastal_town'],
            ['region' => 'croatia', 'slug' => 'makarska', 'name' => 'Makarska', 'type' => 'coastal_town'],
            ['region' => 'bulgaria', 'slug' => 'napospart', 'name' => 'Napospart', 'type' => 'coastal_town'],
            ['region' => 'bulgaria', 'slug' => 'aranyhomok', 'name' => 'Aranyhomok', 'type' => 'coastal_town'],
            ['region' => 'bulgaria', 'slug' => 'neszebar', 'name' => 'Neszebár', 'type' => 'coastal_town'],
            ['region' => 'bulgaria', 'slug' => 'szozopol', 'name' => 'Szozopol', 'type' => 'coastal_town'],
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
                    'featured' => in_array($data['slug'], ['bibione', 'sarti', 'budva', 'rovinj', 'napospart'], true),
                    'is_active' => true,
                    'sort_order' => $sortOrder,
                ],
            );
        }
    }
}
