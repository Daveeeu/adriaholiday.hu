<?php

namespace Database\Factories;

use App\Models\SeoRedirect;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SeoRedirect>
 */
class SeoRedirectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'source_path' => 'regi/'.fake()->unique()->slug(3),
            'target' => '/utazasok',
            'active' => true,
            'origin' => SeoRedirect::ORIGIN_MANUAL,
        ];
    }
}
