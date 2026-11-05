<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The office orders a tour's dates by hand; existing dates start in
 * chronological order (dates without a start date last).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->unsignedInteger('sort_order')->default(0)->after('tour_id');
            $table->index(['tour_id', 'sort_order']);
        });

        DB::table('tour_dates')
            ->select(['id', 'tour_id'])
            ->orderBy('tour_id')
            ->orderByRaw('start_date is null')
            ->orderBy('start_date')
            ->orderBy('id')
            ->get()
            ->groupBy('tour_id')
            ->each(fn ($dates) => $dates->values()->each(
                fn (object $date, int $index) => DB::table('tour_dates')->where('id', $date->id)->update(['sort_order' => $index + 1]),
            ));
    }

    public function down(): void
    {
        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->dropIndex(['tour_id', 'sort_order']);
            $table->dropColumn('sort_order');
        });
    }
};
