<?php

namespace Database\Factories;

use App\Models\ApartmentType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<ApartmentType> */
class ApartmentTypeFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->city().' apartmanok';

        return [
            'slug' => Str::slug($name),
            'name' => $name,
            'is_active' => true,
            'sort_order' => fake()->numberBetween(0, 20),
        ];
    }
}
