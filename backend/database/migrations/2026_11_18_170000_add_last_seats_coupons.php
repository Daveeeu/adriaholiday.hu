<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Coupons a trip page hands out while a date's seats run low: a percentage
 * off the base price, for that one date, valid for a day to the minute. The
 * expiry becomes a moment, and the dates set so far keep holding all day.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('coupons', function (Blueprint $table): void {
            $table->decimal('percent', 5, 2)->nullable()->after('value');
            $table->foreignId('tour_date_id')->nullable()->after('percent')->constrained('tour_dates')->nullOnDelete();
            $table->dateTime('expires_at')->nullable()->change();
        });

        DB::table('coupons')->whereNotNull('expires_at')->update([
            'expires_at' => DB::raw(DB::getDriverName() === 'sqlite'
                ? "datetime(date(expires_at), '+23 hours', '+59 minutes', '+59 seconds')"
                : "TIMESTAMP(DATE(expires_at), '23:59:59')"),
        ]);
    }

    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('tour_date_id');
            $table->dropColumn('percent');
            $table->date('expires_at')->nullable()->change();
        });
    }
};
