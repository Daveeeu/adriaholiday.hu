<?php

namespace Database\Factories;

use App\Models\Tour;
use App\Models\TourDate;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<TourDate> */
class TourDateFactory extends Factory
{
    public function definition(): array
    {
        $start = fake()->dateTimeBetween('+1 month', '+6 months');

        return [
            'tour_id' => Tour::factory(),
            'start_date' => $start,
            'end_date' => (clone $start)->modify('+7 days'),
            'price' => fake()->randomFloat(2, 100, 2000),
            'status' => 'planned',
        ];
    }
}
