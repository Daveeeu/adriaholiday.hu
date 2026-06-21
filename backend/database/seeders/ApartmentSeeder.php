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
        $types = ['greek', 'bulgarian', 'montenegro', 'croatian', 'croatian_new'];
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
            'sarti' => [
                'Sarti Sunset Apartman',
                'Aegean View Sarti',
                'Blue Bay Residence Sarti',
                'Olive Garden Sarti',
                'Sea Pearl Sarti',
            ],
            'nei-pori' => [
                'Nei Pori Beach Residence',
                'Olympus View Nei Pori',
                'Sea Breeze Nei Pori',
                'Sunrise Apartman Nei Pori',
                'Aegean Garden Nei Pori',
            ],
            'paralia' => [
                'Paralia Deluxe Apartman',
                'Paralia Beach Residence',
                'Olympic Coast Paralia',
                'Asteria Apartman Paralia',
                'Sunset House Paralia',
            ],
            'hanioti' => [
                'Hanioti Bay Apartman',
                'Hanioti Garden Residence',
                'Kassandra View Hanioti',
                'Blue Horizon Hanioti',
                'Sea Line Hanioti',
            ],
            'budva' => [
                'Budva Old Town Apartman',
                'Mali Raj Apartman Budva',
                'Adriatic Pearl Budva',
                'Budva View Residence',
                'Sun Coast Budva',
            ],
            'petrovac' => [
                'Petrovac Bay Residence',
                'Oliva Apartman Petrovac',
                'Petrovac Seaside House',
                'Mediteran Residence Petrovac',
                'Sunset Garden Petrovac',
            ],
            'ulcinj' => [
                'Ulcinj Long Beach Apartman',
                'Ulcinj Panorama Residence',
                'Adriatic Star Ulcinj',
                'Ulcinj Sea View',
                'Mango Beach House Ulcinj',
            ],
            'bar' => [
                'Bar Marina Apartman',
                'Bar Coast Residence',
                'Kraljica Apartman Bar',
                'Sunrise Residence Bar',
                'Port View Bar',
            ],
            'rovinj' => [
                'Rovinj Old Town Apartman',
                'Marina Residence Rovinj',
                'Bella Vista Rovinj Suite',
                'Riva Apartman Rovinj',
                'Adriatic Loft Rovinj',
            ],
            'porec' => [
                'Poreč Seaside Residence',
                'Poreč Old Town Apartman',
                'Luna Apartment Poreč',
                'Aqua Blue Poreč',
                'Poreč Garden Suite',
            ],
            'crikvenica' => [
                'Crikvenica Riviera Apartman',
                'Crikvenica Beach Residence',
                'Sunshine Apartman Crikvenica',
                'Adria View Crikvenica',
                'Crikvenica Panorama',
            ],
            'makarska' => [
                'Makarska Riviera Apartman',
                'Makarska Harbor Residence',
                'Biokovo View Makarska',
                'Seaside House Makarska',
                'Blue Bay Makarska',
            ],
            'napospart' => [
                'Napospart Sunrise Residence',
                'Napospart Beach Apartman',
                'Sandy Bay Napospart',
                'Golden Coast Napospart',
                'Napospart Family Suite',
            ],
            'aranyhomok' => [
                'Aranyhomok Panorama',
                'Golden Sands Residence',
                'Aranyhomok Beach Suite',
                'Sunny Dune Aranyhomok',
                'Aranyhomok Sea View',
            ],
            'neszebar' => [
                'Neszebár Old Town Apartman',
                'Neszebár Riviera Residence',
                'St. Sofia Neszebár',
                'Neszebár Sea House',
                'Sunline Neszebár',
            ],
            'szozopol' => [
                'Szozopol Marina Apartman',
                'Szozopol Bay Residence',
                'Black Sea View Szozopol',
                'Szozopol Old Town Suite',
                'Szozopol Coast House',
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
                        'type' => $types[$counter % count($types)],
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
