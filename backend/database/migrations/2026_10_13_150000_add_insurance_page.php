<?php

use App\Models\SiteSetting;
use App\Support\LegalPageContent;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The legacy site's "Biztosítások" page (the ALFA travel and cancellation
 * insurance tables and product information) the booking form links to.
 */
return new class extends Migration
{
    private const KEY = 'insurance_content';

    public function up(): void
    {
        $exists = DB::table('site_settings')->where('group', LegalPageContent::GROUP)->where('key', self::KEY)->exists();

        if ($exists) {
            return;
        }

        DB::table('site_settings')->insert([
            'group' => LegalPageContent::GROUP,
            'key' => self::KEY,
            'type' => LegalPageContent::TYPE,
            'is_public' => true,
            'value' => SiteSetting::encodeValue(LegalPageContent::TYPE, LegalPageContent::defaults()[self::KEY]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        DB::table('site_settings')->where('group', LegalPageContent::GROUP)->where('key', self::KEY)->delete();
    }
};
