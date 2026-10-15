<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A tour can be live on its own page (and bookable there) without showing in
 * the site's offer lists, as the legacy site's school trips were.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->boolean('listed')->default(true)->index()->after('active');
        });
    }

    public function down(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->dropIndex(['listed']);
            $table->dropColumn('listed');
        });
    }
};
