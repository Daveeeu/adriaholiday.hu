<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A tour's departure places follow its boarding order, not the alphabet;
 * adria:departure-places:route-order sets it for the existing tours.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_departure_place_tour', function (Blueprint $table): void {
            $table->unsignedInteger('sort_order')->default(0)->after('fee');
        });
    }

    public function down(): void
    {
        Schema::table('tour_departure_place_tour', function (Blueprint $table): void {
            $table->dropColumn('sort_order');
        });
    }
};
