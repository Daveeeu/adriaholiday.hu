<?php

use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The footer description site setting still said "15 év tapasztalat"; the agency
 * started in 2003, so it says 22+ like the rest of the site.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('site_settings')
            ->where('group', 'footer')
            ->where('key', 'description')
            ->get(['id', 'value'])
            ->each(fn (object $setting) => DB::table('site_settings')->where('id', $setting->id)->update([
                'value' => preg_replace('/\b15\+? év tapasztalat/u', '22+ év tapasztalat', (string) $setting->value),
            ]));

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        // Content update only.
    }
};
