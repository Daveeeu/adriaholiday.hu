<?php

namespace Database\Factories;

use App\Models\BlogCategoryTranslation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BlogCategoryTranslation>
 */
class BlogCategoryTranslationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'locale' => 'hu',
            'name' => fake()->words(2, true),
            'seo_name' => fake()->slug(),
            'seo_auto_generate' => true,
        ];
    }
}
