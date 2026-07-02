<?php

namespace Database\Seeders;

use App\Models\Tour;
use Illuminate\Database\Seeder;

class TourSeeder extends Seeder
{
    public function run(): void
    {
        Tour::query()->withTrashed()->get()->each->forceDelete();
    }
}
