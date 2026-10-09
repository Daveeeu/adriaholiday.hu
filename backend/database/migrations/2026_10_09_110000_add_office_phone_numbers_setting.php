<?php

use App\Support\CompanyContact;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Every office phone number, listed in the footer, on the contact page and in
 * the documents; the header keeps showing the main "phone" number.
 */
return new class extends Migration
{
    public function up(): void
    {
        $exists = DB::table('site_settings')->where('group', CompanyContact::GROUP)->where('key', 'phones')->exists();

        if ($exists) {
            return;
        }

        DB::table('site_settings')->insert([
            'group' => CompanyContact::GROUP,
            'key' => 'phones',
            'type' => CompanyContact::DEFAULTS['phones']['type'],
            'is_public' => true,
            'value' => CompanyContact::DEFAULTS['phones']['value'],
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        DB::table('site_settings')->where('group', CompanyContact::GROUP)->where('key', 'phones')->delete();
    }
};
