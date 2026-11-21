<?php

namespace Database\Factories;

use App\Models\Region;
use App\Models\Tour;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/** @extends Factory<Tour> */
class TourFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->sentence(3);

        return [
            'sort_order' => fake()->numberBetween(1, 1000),
            'active' => true,
            'featured' => false,
            'recommended' => false,
            'xml_enabled' => false,
            'name' => $name,
            'seo_name' => Str::slug($name),
            'seo_auto_generate' => true,
            'list_description' => fake()->paragraph(),
            'short_description' => fake()->sentence(12),
            'program_before' => fake()->paragraph(),
            'program' => fake()->paragraphs(2, true),
            'inclusions' => fake()->paragraphs(2, true),
            'payment_program' => fake()->paragraphs(2, true),
            'prices' => fake()->paragraphs(2, true),
            'discounts' => fake()->paragraph(),
            'notes' => fake()->paragraph(),
            'region_id' => Region::factory(),
            'program_type_id' => 'program-1',
            'travel_mode_id' => 'travel-1',
            'country_ids' => ['hu', 'hr'],
            'tag_ids' => ['family'],
            'category_ids' => ['classic'],
            'price' => fake()->randomFloat(2, 100, 2000),
            'slider_text' => fake()->sentence(),
        ];
    }
}
