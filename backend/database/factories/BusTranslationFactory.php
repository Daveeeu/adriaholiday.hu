<?php

namespace Database\Factories;

use App\Models\BusTranslation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BusTranslation>
 */
class BusTranslationFactory extends Factory
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
            'seo_auto_generate' => true,
        ];
    }
}
