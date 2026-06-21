<?php

namespace Database\Factories;

use App\Models\HomepageOffer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HomepageOffer>
 */
class HomepageOfferFactory extends Factory
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
            'sort_order' => fake()->numberBetween(1, 100),
            'image' => fake()->imageUrl(1280, 720, 'travel', true),
            'image_title' => fake()->words(3, true),
            'link' => '/tours',
        ];
    }
}
