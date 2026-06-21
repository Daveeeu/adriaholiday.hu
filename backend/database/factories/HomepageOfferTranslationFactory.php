<?php

namespace Database\Factories;

use App\Models\HomepageOfferTranslation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HomepageOfferTranslation>
 */
class HomepageOfferTranslationFactory extends Factory
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
            'name' => fake()->words(3, true),
            'seo_name' => fake()->slug(),
            'short_description' => fake()->sentence(8),
        ];
    }
}
