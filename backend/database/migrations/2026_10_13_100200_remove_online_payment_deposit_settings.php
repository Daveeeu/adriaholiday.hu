<?php

use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Online payment now always takes the deposit of BookingPaymentSchedule (its
 * first instalment), so the "full or N% deposit" settings are gone.
 */
return new class extends Migration
{
    private const KEYS = ['online_payment_kind', 'online_payment_deposit_percent'];

    public function up(): void
    {
        DB::table('site_settings')->where('group', 'booking')->whereIn('key', self::KEYS)->delete();

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        DB::table('site_settings')->insertOrIgnore([
            ['group' => 'booking', 'key' => 'online_payment_kind', 'type' => 'string', 'is_public' => true, 'value' => 'full', 'created_at' => now(), 'updated_at' => now()],
            ['group' => 'booking', 'key' => 'online_payment_deposit_percent', 'type' => 'number', 'is_public' => true, 'value' => '30', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
};
