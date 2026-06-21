<?php

namespace Database\Factories;

use App\Models\PartnerBanner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PartnerBanner>
 */
class PartnerBannerFactory extends Factory
{
    protected $model = PartnerBanner::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company() . ' Banner',
            'url' => $this->faker->url(),
            'image' => $this->faker->imageUrl(1200, 628),
            'width' => $this->faker->randomElement([300, 728, 970, 1200]),
            'height' => $this->faker->randomElement([90, 250, 628]),
            'embed_code' => '<div class="banner-embed">Example</div>',
            'status' => $this->faker->randomElement(['draft', 'active', 'archived']),
        ];
    }
}
