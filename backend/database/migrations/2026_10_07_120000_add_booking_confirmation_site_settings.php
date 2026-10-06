<?php

use App\Models\SiteSetting;
use App\Support\Booking\BookingConfirmationSettings;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Adds the admin-editable bank transfer and licence details of the booking
 * confirmation e-mail to existing installs; fresh databases get them from
 * SiteSettingsSeeder.
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        DB::table('site_settings')->insertOrIgnore(collect(BookingConfirmationSettings::DEFAULTS)
            ->map(fn (array $setting, string $key): array => [
                'group' => BookingConfirmationSettings::GROUP,
                'key' => $key,
                'type' => $setting['type'],
                'is_public' => false,
                'value' => SiteSetting::encodeValue($setting['type'], $setting['value']),
                'created_at' => $now,
                'updated_at' => $now,
            ])
            ->values()
            ->all());
    }

    public function down(): void
    {
        DB::table('site_settings')
            ->where('group', BookingConfirmationSettings::GROUP)
            ->whereIn('key', array_keys(BookingConfirmationSettings::DEFAULTS))
            ->delete();
    }
};
