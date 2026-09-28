<?php

use App\Models\SiteSetting;
use App\Support\Booking\BookingInsuranceSettings;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Adds the admin-editable travel and cancellation insurance settings to
 * existing installs; fresh databases get them from SiteSettingsSeeder.
 */
return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        DB::table('site_settings')->insertOrIgnore(collect(BookingInsuranceSettings::DEFAULTS)
            ->map(fn (array $setting, string $key): array => [
                'group' => BookingInsuranceSettings::GROUP,
                'key' => $key,
                'type' => $setting['type'],
                'is_public' => true,
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
            ->where('group', BookingInsuranceSettings::GROUP)
            ->whereIn('key', array_keys(BookingInsuranceSettings::DEFAULTS))
            ->delete();
    }
};
