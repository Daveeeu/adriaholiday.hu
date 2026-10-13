<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The short note behind the meals and accommodation of a tour ("2 ágyas szoba",
 * "Vacsora igényelhető: 38.900 Ft/fő"), shown in an info box as on the legacy site.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->text('catering_info')->nullable()->after('accommodation');
            $table->text('accommodation_info')->nullable()->after('catering_info');
        });
    }

    public function down(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->dropColumn(['catering_info', 'accommodation_info']);
        });
    }
};
