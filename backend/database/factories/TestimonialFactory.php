<?php

namespace Database\Factories;

use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Testimonial>
 */
class TestimonialFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => 'Bosznia '.fake()->date('Y.m.d.'),
            'author' => fake()->name(),
            'body' => '<p>'.fake()->paragraph(6).'</p>',
            'published_at' => fake()->dateTimeBetween('-2 years', '-1 day'),
            'active' => true,
        ];
    }
}
