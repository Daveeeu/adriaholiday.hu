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
            'featured' => fake()->boolean(),
            'recommended' => fake()->boolean(),
            'partner_offer' => fake()->boolean(),
            'image_offer' => fake()->boolean(),
            'xml_enabled' => fake()->boolean(),
            'slider_image_enabled' => fake()->boolean(),
            'slider_text_enabled' => fake()->boolean(),
            'name' => $name,
            'seo_name' => Str::slug($name),
            'seo_auto_generate' => true,
            'action1' => fake()->word(),
            'action2' => fake()->word(),
            'list_description' => fake()->paragraph(),
            'short_description' => fake()->sentence(12),
            'program_pdf_path' => null,
            'program_pdf_file' => 'program.pdf',
            'slider_image' => null,
            'program_before' => fake()->paragraph(),
            'program' => fake()->paragraphs(2, true),
            'inclusions' => fake()->paragraphs(2, true),
            'payment_program' => fake()->paragraphs(2, true),
            'prices' => fake()->paragraphs(2, true),
            'discounts' => fake()->paragraph(),
            'notes' => fake()->paragraph(),
            'region_id' => Region::factory(),
            'group_id' => 'group-1',
            'seasonal_group_id' => 'season-1',
            'fit_id' => 'fit-1',
            'program_type_id' => 'program-1',
            'travel_mode_id' => 'travel-1',
            'difficulty_id' => 'difficulty-1',
            'country_ids' => ['hu', 'hr'],
            'tag_ids' => ['family'],
            'category_ids' => ['classic'],
            'price' => fake()->randomFloat(2, 100, 2000),
            'displayed_price' => fake()->numberBetween(100, 2000).' EUR',
            'slider_text' => fake()->sentence(),
        ];
    }
}
