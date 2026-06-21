<?php

namespace Database\Factories;

use App\Models\Apartment;
use App\Models\Gallery;
use App\Models\Location;
use App\Models\Region;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Apartment>
 */
class ApartmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $names = [
            'Dune Villa Bibione',
            'Horizon Apartman Bibione',
            'Cinzia Apartman Bibione',
            'Schiera/Sirbi Apartman Bibione',
            'Abbyzia Apartman Bibione',
            'Accademia Apartman Lignano',
            'Acquaverde Apartman Lignano',
            'Caorle Beach Residence',
            'Sarti Sunset Apartman',
            'Budva Old Town Apartman',
            'Napospart Sunrise Residence',
        ];
        $name = fake()->randomElement($names);

        return [
            'region_id' => Region::factory(),
            'location_id' => Location::factory(),
            'gallery_id' => Gallery::factory(),
            'type' => fake()->randomElement(['greek', 'bulgarian', 'montenegro', 'croatian', 'croatian_new']),
            'name' => $name,
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(1, 999),
            'code' => strtoupper(substr(Str::slug($name, ''), 0, 3)).'-'.fake()->unique()->numberBetween(1, 999),
            'seo_name' => Str::slug($name),
            'seo_auto_generate' => true,
            'is_active' => true,
            'featured' => fake()->boolean(),
            'is_accommodation' => fake()->boolean(),
            'stars' => fake()->numberBetween(1, 5),
            'bedrooms' => fake()->numberBetween(1, 5),
            'bathrooms' => fake()->numberBetween(1, 4),
            'max_guests' => fake()->numberBetween(2, 8),
            'size_m2' => fake()->randomFloat(2, 25, 180),
            'address' => fake()->address(),
            'map_address' => fake()->address(),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'coordinates' => fake()->latitude().', '.fake()->longitude(),
            'short_description' => fake()->sentence(16),
            'description' => fake()->paragraphs(3, true),
            'additional_information' => fake()->paragraph(),
            'apartment_type_content' => fake()->paragraph(),
            'apartment_type_description' => fake()->paragraph(),
            'apartment_type_text_description' => fake()->paragraph(),
            'apartment_type_text_description_2' => fake()->paragraph(),
            'all_inclusive_description' => fake()->paragraph(),
            'price_header' => fake()->sentence(3),
            'price_inner_header' => fake()->sentence(4),
            'pricing_matrix' => [
                'columns' => [],
                'rows' => [],
            ],
            'price_seasons' => [
                [
                    'id' => fake()->uuid(),
                    'start_date' => now()->startOfMonth()->toDateString(),
                    'end_date' => now()->endOfMonth()->toDateString(),
                    'category' => 'Standard',
                    'beds' => '2',
                    'price' => fake()->randomFloat(2, 50, 300),
                ],
            ],
            'amenities' => ['wifi', 'parking'],
            'services' => ['cleaning'],
            'status' => 'published',
            'sort_order' => fake()->numberBetween(1, 100),
        ];
    }
}
