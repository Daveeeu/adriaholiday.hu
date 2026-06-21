<?php

namespace Database\Factories;

use App\Models\Tour;
use App\Models\TourPartnerBonus;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<TourPartnerBonus> */
class TourPartnerBonusFactory extends Factory
{
    public function definition(): array
    {
        return [
            'tour_id' => Tour::factory(),
            'sort_order' => fake()->numberBetween(1, 10),
            'label' => fake()->word(),
            'value' => fake()->word(),
        ];
    }
}
