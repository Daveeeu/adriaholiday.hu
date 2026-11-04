<?php

use App\Models\SiteSetting;
use App\Support\LegalPageContent;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The cookie policy names every cookie the site now sets: Google Analytics 4,
 * Google Ads and the Meta Pixel (all through Google Tag Manager, after
 * consent) next to the necessary and first-party statistics ones. A policy the
 * office has edited in the admin is left alone; only the untouched previous
 * default is replaced.
 */
return new class extends Migration
{
    private const KEY = 'cookie_content';

    /** sha1 of the previous default text (database/content/legal/cookie.html before this change). */
    private const PREVIOUS_DEFAULT_SHA1 = '4955348db7360f15fc774fb06f2b40a590e82295';

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
