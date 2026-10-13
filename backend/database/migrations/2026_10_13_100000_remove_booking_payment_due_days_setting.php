<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Payment deadlines now follow the instalment rules of BookingPaymentSchedule
 * (by days to departure), so the single "pay within N days" setting is gone.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('site_settings')->where('group', 'booking')->where('key', 'payment_due_days')->delete();
    }

    public function down(): void
    {
        DB::table('site_settings')->insertOrIgnore([
            'group' => 'booking',
            'key' => 'payment_due_days',
            'type' => 'number',
            'is_public' => false,
            'value' => '3',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
};
