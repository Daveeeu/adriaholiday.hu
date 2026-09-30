<?php

use App\Support\Booking\BookingPaymentSettings;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Adds the admin-editable Base Barion Pixel id to existing installs; fresh
 * databases get it from SiteSettingsSeeder.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('site_settings')->insertOrIgnore([
            'group' => BookingPaymentSettings::GROUP,
            'key' => 'barion_pixel_id',
            'type' => 'string',
            'is_public' => true,
            'value' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('site_settings')
            ->where('group', BookingPaymentSettings::GROUP)
            ->where('key', 'barion_pixel_id')
            ->delete();
    }
};
