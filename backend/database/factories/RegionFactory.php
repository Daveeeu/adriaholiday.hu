<?php

namespace Database\Factories;

use App\Models\Region;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Region>
 */
class RegionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => Str::slug(fake()->unique()->words(3, true)),
            'name' => fake()->city(),
            'country_code' => fake()->countryCode(),
            'timezone' => 'Europe/Budapest',
            'currency' => fake()->randomElement(['EUR', 'HUF']),
            'hero_image_url' => fake()->imageUrl(1280, 720, 'travel', true),
            'summary' => fake()->sentence(8),
            'description' => fake()->paragraphs(2, true),
            'is_active' => true,
            'sort_order' => fake()->numberBetween(1, 100),
        ];
    }
}
