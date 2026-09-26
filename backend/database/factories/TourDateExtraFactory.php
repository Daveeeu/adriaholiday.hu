<?php

namespace Database\Factories;

use App\Models\TourDate;
use App\Models\TourDateExtra;
use App\Support\Tour\TourExtraPriceUnit;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<TourDateExtra> */
class TourDateExtraFactory extends Factory
{
    public function definition(): array
    {
        return [
            'tour_date_id' => TourDate::factory(),
            'name' => fake()->randomElement(['Vacsora', 'Egyágyas felár', 'Fakultatív program']),
            'price' => fake()->numberBetween(5, 50) * 1000,
            'price_unit' => TourExtraPriceUnit::PER_PERSON,
            'mandatory' => false,
            'sort_order' => 0,
        ];
    }
}
