<?php

use App\Support\CompanyContact;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The office's +36 20 203 8831 number was missing from the listed phone
 * numbers (footer, contact cards, documents); it is added to the end.
 */
return new class extends Migration
{
    private const NUMBER = '+36 20 203 8831';

    public function up(): void
    {
        $setting = DB::table('site_settings')->where('group', CompanyContact::GROUP)->where('key', 'phones')->first(['id', 'value']);

        if ($setting === null || str_contains(preg_replace('/\D/', '', (string) $setting->value) ?? '', '202038831')) {
            return;
        }

        DB::table('site_settings')->where('id', $setting->id)->update([
            'value' => rtrim((string) $setting->value)."\n".self::NUMBER,
            'updated_at' => now(),
        ]);

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        // Content update only.
    }
};
