<?php

namespace Database\Factories;

use App\Models\TourPartnerOffer;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<TourPartnerOffer> */
class TourPartnerOfferFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'partner_name' => fake()->name(),
            'partner_email' => fake()->safeEmail(),
            'inquiry_date' => fake()->date(),
            'status' => fake()->randomElement(['new', 'contacted', 'closed']),
            'note' => fake()->sentence(),
            'active' => true,
        ];
    }
}
