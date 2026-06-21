<?php

namespace Database\Seeders;

use App\Models\PartnerBanner;
use Illuminate\Database\Seeder;

class PartnerBannerSeeder extends Seeder
{
    public function run(): void
    {
        PartnerBanner::factory()->count(10)->create();
    }
}
