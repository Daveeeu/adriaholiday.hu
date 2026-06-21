<?php

namespace Database\Factories;

use App\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
{
    protected $model = Coupon::class;

    public function definition(): array
    {
        return [
            'active' => $this->faker->boolean(75),
            'name' => $this->faker->optional()->name(),
            'email' => $this->faker->optional()->safeEmail(),
            'code' => strtoupper($this->faker->unique()->bothify('CPN-#####')),
            'value' => $this->faker->randomFloat(2, 5, 500),
            'expires_at' => $this->faker->optional()->dateTimeBetween('now', '+1 year')?->format('Y-m-d'),
            'used' => $this->faker->boolean(20),
        ];
    }
}
