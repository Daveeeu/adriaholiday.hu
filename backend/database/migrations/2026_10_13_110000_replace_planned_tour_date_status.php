<?php

use App\Support\PublicContentCache;
use App\Support\Tour\TourDateStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * "Tervezett" (planned) dates were bookable like available ones but told
 * customers the departure was not certain; a date is now available, sold out
 * or cancelled.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('tour_dates')->where('status', 'planned')->update(['status' => TourDateStatus::AVAILABLE]);

        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->string('status')->default(TourDateStatus::AVAILABLE)->change();
        });

        PublicContentCache::bump(PublicContentCache::OFFERS);
    }

    public function down(): void
    {
        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->string('status')->default('planned')->change();
        });
    }
};
