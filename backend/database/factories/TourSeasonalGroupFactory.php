<?php

namespace Database\Factories;

use App\Models\TourSeasonalGroup;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<TourSeasonalGroup> */
class TourSeasonalGroupFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->words(3, true);

        return [
            'active' => true,
            'menu_type' => fake()->randomElement(['intro', 'request', 'featured', 'travel', 'icon']),
            'name' => $name,
            'seo_name' => Str::slug($name),
            'seo_auto_generate' => true,
            'box_text' => fake()->sentence(),
            'has_offers' => fake()->boolean(),
        ];
    }
}
