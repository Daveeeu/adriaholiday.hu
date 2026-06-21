<?php

namespace Database\Seeders;

use App\Models\PartnerFinanceRecord;
use Illuminate\Database\Seeder;

class PartnerFinanceRecordSeeder extends Seeder
{
    public function run(): void
    {
        PartnerFinanceRecord::factory()->count(30)->create();
    }
}
