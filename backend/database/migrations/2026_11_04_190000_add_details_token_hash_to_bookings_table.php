<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The link e-mailed to a customer who left deferred booking details for later
 * carries a random token; only its hash is stored.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->char('details_token_hash', 64)->nullable()->unique()->after('payload');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table): void {
            $table->dropUnique(['details_token_hash']);
            $table->dropColumn('details_token_hash');
        });
    }
};
