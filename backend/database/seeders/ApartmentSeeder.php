<?php

namespace Database\Seeders;

use App\Models\Apartment;
use App\Models\Gallery;
use App\Models\Location;
use App\Models\Region;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ApartmentSeeder extends Seeder
{
    public function run(): void
    {
        $locations = Location::query()->orderBy('id')->get()->values();
        $galleries = Gallery::query()->orderBy('id')->get()->values();

        $apartmentNames = [
            'bibione' => [
                'Dune Villa Bibione',
                'Horizon Apartman Bibione',
                'Cinzia Apartman Bibione',
                'Schiera/Sirbi Apartman Bibione',
                'Abbyzia Apartman Bibione',
            ],
            'lignano' => [
                'Accademia Apartman Lignano',
                'Acquaverde Apartman Lignano',
                'Azzurra Residence Lignano',
                'Laguna Vista Lignano',
                'San Marco Apartman Lignano',
            ],
            'caorle' => [
                'Caorle Beach Residence',
                'Marina Apartman Caorle',
                'Veneto Apartman Caorle',
                'Laguna Garden Caorle',
                'Seaside Residence Caorle',
            ],
            'jesolo' => [
                'Jesolo Mare Apartman',
                'Altanea Apartman Jesolo',
                'Adriatic Blue Jesolo',
                'Piazza Milano Residence',
                'Lido Residence Jesolo',
            ],
        ];

        $counter = 1;

        foreach ($locations as $locationIndex => $location) {
            $region = Region::query()->find($location->region_id);
            $gallery = $galleries[$locationIndex % $galleries->count()];
            $names = $apartmentNames[$location->slug] ?? [$location->name.' Apartman 1', $location->name.' Apartman 2', $location->name.' Apartman 3', $location->name.' Apartman 4', $location->name.' Apartman 5'];

            for ($i = 0; $i < 5; $i++) {
                $name = $names[$i % count($names)];
                $code = strtoupper(substr($location->slug, 0, 3)).'-'.str_pad((string) $counter, 2, '0', STR_PAD_LEFT);

                Apartment::query()->updateOrCreate(
                    [
                        'slug' => Str::slug("{$location->slug} {$name}"),
                    ],
                    [
                        'region_id' => $region->id,
                        'location_id' => $location->id,
                        'gallery_id' => $gallery->id,
                        'type' => 'italian',
                        'name' => $name,
                        'code' => $code,
                        'seo_name' => Str::slug($name),
                        'seo_auto_generate' => true,
                        'is_active' => true,
                        'featured' => $i === 0,
                        'is_accommodation' => true,
                        'stars' => ($counter % 5) + 1,
                        'bedrooms' => ($counter % 4) + 1,
                        'bathrooms' => ($counter % 3) + 1,
                        'max_guests' => 2 + ($counter % 6),
                        'size_m2' => 35 + $counter,
                        'address' => "{$location->name}, {$region->name}",
                        'map_address' => "{$location->name}, {$region->name}",
                        'latitude' => 40 + ($counter * 0.01),
                        'longitude' => 18 + ($counter * 0.01),
                        'coordinates' => (40 + ($counter * 0.01)).', '.(18 + ($counter * 0.01)),
                        'short_description' => "{$name} rövid bemutatása.",
                        'description' => "{$name} részletes bemutatása az admin tesztadatokban.",
                        'additional_information' => "{$name} további információk.",
                        'apartment_type_content' => "{$name} típus tartalom.",
                        'apartment_type_description' => "{$name} típus leírás.",
                        'apartment_type_text_description' => "{$name} szöveges leírás.",
                        'apartment_type_text_description_2' => "{$name} második szöveges leírás.",
                        'all_inclusive_description' => "{$name} all inclusive leírás.",
                        'price_header' => "{$name} áraink.",
                        'price_inner_header' => "{$name} részletes árképzés.",
                        'pricing_matrix' => [
                            'columns' => [
                                [
                                    'id' => 'summer',
                                    'label' => 'Nyár',
                                    'startDate' => '2026-06-01',
                                    'endDate' => '2026-08-31',
                                ],
                                [
                                    'id' => 'autumn',
                                    'label' => 'Ősz',
                                    'startDate' => '2026-09-01',
                                    'endDate' => '2026-10-31',
                                ],
                            ],
                            'rows' => [
                                [
                                    'id' => 'standard',
                                    'category' => 'Standard',
                                    'beds' => 2,
                                    'prices' => [120, 95],
                                ],
                            ],
                        ],
                        'price_seasons' => [
                            [
                                'id' => (string) Str::uuid(),
                                'start_date' => '2026-06-01',
                                'end_date' => '2026-08-31',
                                'category' => 'Standard',
                                'beds' => '2',
                                'price' => 120 + $counter,
                            ],
                            [
                                'id' => (string) Str::uuid(),
                                'start_date' => '2026-09-01',
                                'end_date' => '2026-10-31',
                                'category' => 'Prémium',
                                'beds' => '4',
                                'price' => 150 + $counter,
                            ],
                        ],
                        'amenities' => ['wifi', 'parking', 'air_conditioning'],
                        'services' => ['cleaning', 'transfer'],
                        'status' => 'published',
                        'sort_order' => $counter,
                    ],
                );

                $counter++;
            }
        }
    }
}
