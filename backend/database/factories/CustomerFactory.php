<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'email' => fake()->unique()->safeEmail(),
            'name' => fake()->name(),
            'phone' => fake()->numerify('06301234###'),
            'postal_code' => fake()->numerify('####'),
            'city' => fake()->city(),
            'address' => fake()->streetAddress(),
            'referral_code' => fake()->unique()->numerify('######'),
            'registered_at' => fake()->dateTimeBetween('-5 years', '-1 day'),
        ];
    }
}
