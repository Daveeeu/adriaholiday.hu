<?php

use App\Models\SiteSetting;
use App\Support\CompanyContact;
use App\Support\LegalPageContent;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Replaces the placeholder contact details and legal page texts of existing
 * installs with the company data, terms (ÁSZF) and privacy policy of the legacy
 * adriaholiday.hu site; fresh databases get them from SiteSettingsSeeder.
 * The legal texts become rich text so their headings and lists are kept.
 */
return new class extends Migration
{
    public function up(): void
    {
        $isSeededInstall = DB::table('site_settings')
            ->where('group', LegalPageContent::GROUP)
            ->whereIn('key', array_keys(LegalPageContent::FILES))
            ->exists();

        if (! $isSeededInstall) {
            return;
        }

        foreach (CompanyContact::DEFAULTS as $key => $setting) {
            $this->store(CompanyContact::GROUP, $key, $setting['type'], $setting['value']);
        }

        foreach (LegalPageContent::defaults() as $key => $html) {
            $this->store(LegalPageContent::GROUP, $key, LegalPageContent::TYPE, $html);
        }

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        DB::table('site_settings')
            ->where('group', CompanyContact::GROUP)
            ->where('key', 'opening_hours')
            ->delete();

        DB::table('site_settings')
            ->where('group', LegalPageContent::GROUP)
            ->whereIn('key', array_keys(LegalPageContent::FILES))
            ->update(['type' => 'text']);
    }

    private function store(string $group, string $key, string $type, string $value): void
    {
        $attributes = [
            'type' => $type,
            'is_public' => true,
            'value' => SiteSetting::encodeValue($type, $value),
            'updated_at' => now(),
        ];

        $query = DB::table('site_settings')->where('group', $group)->where('key', $key);

        if ($query->exists()) {
            $query->update($attributes);

            return;
        }

        DB::table('site_settings')->insert([
            'group' => $group,
            'key' => $key,
            ...$attributes,
            'created_at' => now(),
        ]);
    }
};
