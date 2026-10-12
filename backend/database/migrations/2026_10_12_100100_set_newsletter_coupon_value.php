<?php

use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Installs that never ran SiteSettingsSeeder had no newsletter coupon value, so a
 * subscriber would have been sent a 0 Ft coupon. The travel club terms promise
 * 5000 Ft; an amount set in the admin is kept.
 */
return new class extends Migration
{
    public function up(): void
    {
        $exists = DB::table('site_settings')->where('group', 'newsletter')->where('key', 'coupon_value')->exists();

        if ($exists) {
            return;
        }

        DB::table('site_settings')->insert([
            'group' => 'newsletter',
            'key' => 'coupon_value',
            'type' => 'number',
            'is_public' => true,
            'value' => '5000',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        // Content update only.
    }
};
