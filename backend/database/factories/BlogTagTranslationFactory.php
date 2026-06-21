<?php

namespace Database\Factories;

use App\Models\BlogTagTranslation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BlogTagTranslation>
 */
class BlogTagTranslationFactory extends Factory
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
        ];
    }
}
