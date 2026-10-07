<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The legacy site shows a tour's "Kedvcsináló", "Belépőjegyek" and
 * "Fakultatív program" tabs next to its program; they get their own rich
 * text fields.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->longText('teaser')->nullable()->after('program');
            $table->longText('tickets')->nullable()->after('teaser');
            $table->longText('optional_programs')->nullable()->after('tickets');
        });
    }

    public function down(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->dropColumn(['teaser', 'tickets', 'optional_programs']);
        });
    }
};
