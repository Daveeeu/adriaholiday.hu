<?php

namespace Database\Factories;

use App\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'kind' => Page::KIND_PAGE,
            'title' => fake()->sentence(3),
            'slug' => fake()->unique()->slug(2),
            'content' => '<p>'.fake()->paragraph().'</p>',
            'active' => true,
        ];
    }

    public function textBlock(): static
    {
        return $this->state(fn (): array => ['kind' => Page::KIND_TEXT_BLOCK, 'slug' => null]);
    }
}
