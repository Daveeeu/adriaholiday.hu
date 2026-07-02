<?php

namespace Database\Factories;

use App\Models\PortfolioContentBlock;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PortfolioContentBlock>
 */
class PortfolioContentBlockFactory extends Factory
{
    protected $model = PortfolioContentBlock::class;

    public function definition(): array
    {
        return [
            'key' => 'home.example.' . $this->faker->unique()->slug(),
            'page' => 'home',
            'section' => 'example',
            'label' => $this->faker->sentence(3),
            'type' => 'text',
            'locale' => 'hu',
            'value' => $this->faker->sentence(),
            'value_json' => null,
            'draft_value' => null,
            'draft_value_json' => null,
            'is_published' => true,
            'updated_by' => null,
        ];
    }
}
