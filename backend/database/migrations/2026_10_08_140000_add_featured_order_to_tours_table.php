<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The order of the homepage's featured offers, kept apart from the tour's
 * general sort order (like the legacy site's own featured order).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->unsignedSmallInteger('featured_order')->nullable()->after('featured');
        });
    }

    public function down(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->dropColumn('featured_order');
        });
    }
};
