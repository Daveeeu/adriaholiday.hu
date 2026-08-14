<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Apartment bookings are now Italy-only. Locations, apartments and apartment
 * galleries under non-Italian regions are soft-deleted rather than dropped,
 * since those Region rows themselves stay in use by other modules (e.g. the
 * Montenegro region is still referenced by existing tours).
 */
return new class extends Migration
{
    private const NON_ITALIAN_APARTMENT_TYPE_SLUGS = [
        'greek',
        'bulgarian',
        'montenegro',
        'croatian',
        'croatian_new',
    ];

    public function up(): void
    {
        $now = now();
        $nonItalianRegionIds = DB::table('regions')->where('country_code', '!=', 'IT')->pluck('id');

        DB::table('apartments')
            ->whereIn('region_id', $nonItalianRegionIds)
            ->whereNull('deleted_at')
            ->update(['deleted_at' => $now]);

        DB::table('locations')
            ->whereIn('region_id', $nonItalianRegionIds)
            ->whereNull('deleted_at')
            ->update(['deleted_at' => $now]);

        DB::table('galleries')
            ->where('category', 'apartment')
            ->whereIn('region_id', $nonItalianRegionIds)
            ->whereNull('deleted_at')
            ->update(['deleted_at' => $now]);

        DB::table('apartment_types')
            ->whereIn('slug', self::NON_ITALIAN_APARTMENT_TYPE_SLUGS)
            ->whereNull('deleted_at')
            ->update(['deleted_at' => $now]);
    }

    public function down(): void
    {
        $nonItalianRegionIds = DB::table('regions')->where('country_code', '!=', 'IT')->pluck('id');

        DB::table('apartments')->whereIn('region_id', $nonItalianRegionIds)->update(['deleted_at' => null]);
        DB::table('locations')->whereIn('region_id', $nonItalianRegionIds)->update(['deleted_at' => null]);
        DB::table('galleries')->where('category', 'apartment')->whereIn('region_id', $nonItalianRegionIds)->update(['deleted_at' => null]);
        DB::table('apartment_types')->whereIn('slug', self::NON_ITALIAN_APARTMENT_TYPE_SLUGS)->update(['deleted_at' => null]);
    }
};
