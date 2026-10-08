<?php

use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The agency's current social profiles: the Instagram setting still pointed at a
 * handle the agency does not use, and the TikTok profile was missing.
 */
return new class extends Migration
{
    private const PROFILES = [
        'facebook' => 'https://www.facebook.com/adriaholiday',
        'instagram' => 'https://www.instagram.com/adriaholidayutazasok/',
        'tiktok' => 'https://www.tiktok.com/@adria.holiday',
    ];

    public function up(): void
    {
        $now = now();

        foreach (self::PROFILES as $key => $url) {
            $exists = DB::table('site_settings')->where('group', 'social')->where('key', $key)->exists();

            if ($exists) {
                DB::table('site_settings')->where('group', 'social')->where('key', $key)->update([
                    'value' => $url,
                    'updated_at' => $now,
                ]);

                continue;
            }

            DB::table('site_settings')->insert([
                'group' => 'social',
                'key' => $key,
                'type' => 'string',
                'is_public' => true,
                'value' => $url,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        // Content update only.
    }
};
