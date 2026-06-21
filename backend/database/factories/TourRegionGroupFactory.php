<?php

namespace Database\Factories;

use App\Models\TourRegionGroup;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<TourRegionGroup> */
class TourRegionGroupFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->words(3, true);

        return [
            'active' => true,
            'featured_on_homepage' => fake()->boolean(),
            'type' => fake()->randomElement(['region', 'group', 'theme']),
            'name' => $name,
            'seo_name' => Str::slug($name),
            'seo_auto_generate' => true,
            'gallery_id' => null,
            'description' => fake()->paragraph(),
            'list_below_text' => fake()->sentence(),
            'travel_conditions_link' => fake()->url(),
        ];
    }
}
