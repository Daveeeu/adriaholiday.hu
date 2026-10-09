<?php

use App\Support\LegalPageContent;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The contact page's phone card now lists every office number (contact.phones),
 * so the same list is dropped from the page's text; the on-call number stays.
 */
return new class extends Migration
{
    public function up(): void
    {
        $query = DB::table('site_settings')->where('group', LegalPageContent::GROUP)->where('key', 'contact_content');
        $html = $query->value('value');

        if (! is_string($html)) {
            return;
        }

        $withoutPhoneList = preg_replace('#<h2>\s*Telefonszámaink\s*</h2>\s*<p>(?:(?!</p>).)*</p>\s*#su', '', $html, 1);

        if ($withoutPhoneList === null || $withoutPhoneList === $html) {
            return;
        }

        $query->update(['value' => $withoutPhoneList, 'updated_at' => now()]);

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        // Content update only.
    }
};
