<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A departure place can cost extra on one tour only (e.g. "Budapest BOK
 * csarnok" +4 700 Ft/fő on a single tour). The per-tour fee overrides the
 * departure place's general fee when set.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_departure_place_tour', function (Blueprint $table): void {
            $table->decimal('fee', 10, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('tour_departure_place_tour', function (Blueprint $table): void {
            $table->dropColumn('fee');
        });
    }
};
