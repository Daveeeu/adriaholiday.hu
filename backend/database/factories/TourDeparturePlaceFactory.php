<?php

namespace Database\Factories;

use App\Models\TourDeparturePlace;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<TourDeparturePlace> */
class TourDeparturePlaceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'active' => true,
            'name' => fake()->city(),
            'city' => fake()->city(),
            'fee' => fake()->randomFloat(2, 0, 50),
        ];
    }
}
