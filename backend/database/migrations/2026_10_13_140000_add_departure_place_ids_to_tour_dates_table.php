<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A date may offer only some of its tour's departure places (as on the legacy
 * site); null offers all of them.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->json('departure_place_ids')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->dropColumn('departure_place_ids');
        });
    }
};
