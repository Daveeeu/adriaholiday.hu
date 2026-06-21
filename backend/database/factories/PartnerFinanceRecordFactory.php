<?php

namespace Database\Factories;

use App\Models\PartnerFinanceRecord;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PartnerFinanceRecord>
 */
class PartnerFinanceRecordFactory extends Factory
{
    protected $model = PartnerFinanceRecord::class;

    public function definition(): array
    {
        return [
            'partner_name' => $this->faker->company(),
            'date' => $this->faker->optional()->date(),
            'amount' => $this->faker->randomFloat(2, 100, 5000),
            'type' => $this->faker->randomElement([
                'commission_credit',
                'commission_payout',
                'location_credit',
                'commission_list',
                'travelable_commission',
            ]),
            'status' => $this->faker->randomElement(['pending', 'approved', 'paid', 'settled']),
            'balance' => $this->faker->randomFloat(2, 0, 10000),
            'note' => $this->faker->optional()->sentence(),
        ];
    }
}
