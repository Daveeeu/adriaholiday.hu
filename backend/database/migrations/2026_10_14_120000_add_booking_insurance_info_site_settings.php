<?php

use App\Models\SiteSetting;
use App\Support\Booking\BookingInsuranceSettings;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Adds the admin-editable descriptions of the booking insurances, shown behind
 * their ⓘ in the booking form, to existing installs.
 */
return new class extends Migration
{
    private const KEYS = ['travel_insurance_info', 'cancellation_insurance_info'];

    public function up(): void
    {
        $now = now();

        DB::table('site_settings')->insertOrIgnore(collect(self::KEYS)
            ->map(function (string $key) use ($now): array {
                $setting = BookingInsuranceSettings::DEFAULTS[$key];

                return [
                    'group' => BookingInsuranceSettings::GROUP,
                    'key' => $key,
                    'type' => $setting['type'],
                    'is_public' => true,
                    'value' => SiteSetting::encodeValue($setting['type'], $setting['value']),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            })
            ->all());

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        DB::table('site_settings')
            ->where('group', BookingInsuranceSettings::GROUP)
            ->whereIn('key', self::KEYS)
            ->delete();
    }
};
