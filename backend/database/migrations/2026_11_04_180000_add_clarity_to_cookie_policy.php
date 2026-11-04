<?php

use App\Models\SiteSetting;
use App\Support\LegalPageContent;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The cookie policy adds Microsoft Clarity (heatmaps and masked session
 * recordings, loaded through Google Tag Manager with statistics consent). As
 * before, only the untouched previous default is replaced; a policy the office
 * has edited in the admin is left alone.
 */
return new class extends Migration
{
    private const KEY = 'cookie_content';

    /** sha1 of the previous default text, set by 2026_11_04_160000_update_cookie_policy_for_tag_manager. */
    private const PREVIOUS_DEFAULT_SHA1 = '8ac6e4fdbe8ffe09646d40814ec29eb1bf23963d';

    public function up(): void
    {
        $setting = DB::table('site_settings')
            ->where('group', LegalPageContent::GROUP)
            ->where('key', self::KEY)
            ->first(['id', 'value']);

        if ($setting === null || sha1(trim((string) $setting->value)) !== self::PREVIOUS_DEFAULT_SHA1) {
            return;
        }

        DB::table('site_settings')->where('id', $setting->id)->update([
            'value' => SiteSetting::encodeValue(LegalPageContent::TYPE, LegalPageContent::defaults()[self::KEY]),
            'updated_at' => now(),
        ]);

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        // Content update only.
    }
};
