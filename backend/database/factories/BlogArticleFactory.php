<?php

namespace Database\Factories;

use App\Models\BlogArticle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BlogArticle>
 */
class BlogArticleFactory extends Factory
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
            'published_at' => now(),
            'show_on_homepage' => fake()->boolean(),
            'portfolio_featured' => fake()->boolean(20),
            'portfolio_sort_order' => fake()->numberBetween(0, 20),
            'image' => fake()->imageUrl(1280, 720, 'travel', true),
            'image_title' => fake()->words(3, true),
            'views' => fake()->numberBetween(0, 1000),
            'sort_order' => fake()->numberBetween(1, 100),
        ];
    }
}
