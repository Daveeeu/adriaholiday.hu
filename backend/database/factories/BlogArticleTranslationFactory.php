<?php

namespace Database\Factories;

use App\Models\BlogArticleTranslation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BlogArticleTranslation>
 */
class BlogArticleTranslationFactory extends Factory
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
            'title' => fake()->sentence(4),
            'seo_name' => fake()->slug(),
            'seo_auto_generate' => true,
            'excerpt' => fake()->sentence(12),
            'content' => fake()->paragraphs(3, true),
        ];
    }
}
