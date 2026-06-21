<?php

namespace Database\Factories;

use App\Models\Location;
use App\Models\Region;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Location>
 */
class LocationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'region_id' => Region::factory(),
            'slug' => fake()->unique()->slug(),
            'name' => fake()->city(),
            'type' => fake()->randomElement(['city', 'island', 'coastal_town', 'national_park']),
            'latitude' => fake()->latitude(),
            'longitude' => fake()->longitude(),
            'transfer_minutes_from_airport' => fake()->numberBetween(10, 180),
            'description' => fake()->paragraph(),
            'featured' => fake()->boolean(),
            'is_active' => true,
            'sort_order' => fake()->numberBetween(1, 100),
        ];
    }
}
