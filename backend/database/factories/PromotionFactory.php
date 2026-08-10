<?php

namespace Database\Factories;

use App\Models\Promotion;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Promotion>
 */
class PromotionFactory extends Factory
{
    protected $model = Promotion::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'message' => $this->faker->sentence(10),
            'code' => strtoupper($this->faker->bothify('PROMO-#####')),
            'is_active' => true,
            'starts_at' => null,
            'expires_at' => null,
        ];
    }
}
