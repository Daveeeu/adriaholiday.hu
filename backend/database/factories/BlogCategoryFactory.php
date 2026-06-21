<?php

namespace Database\Factories;

use App\Models\BlogCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BlogCategory>
 */
class BlogCategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'active' => true,
            'column' => fake()->randomElement(['1', '2', '3']),
            'seo_name' => fake()->slug(),
            'sort_order' => fake()->numberBetween(1, 100),
        ];
    }
}
