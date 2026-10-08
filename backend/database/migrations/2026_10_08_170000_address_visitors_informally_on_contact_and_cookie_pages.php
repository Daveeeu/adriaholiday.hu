<?php

use App\Support\LegalPageContent;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The site addresses visitors informally (tegezés) everywhere; the contact and
 * cookie pages still used the formal voice. Only the affected sentences are
 * replaced, so edits made to the rest of the pages in the admin are kept.
 */
return new class extends Migration
{
    private const REPLACEMENTS = [
        'contact_content' => [
            'Vegye fel velünk a kapcsolatot' => 'Vedd fel velünk a kapcsolatot',
        ],
        'cookie_content' => [
            'csak az Ön hozzájárulása után aktiváljuk' => 'csak a hozzájárulásod után aktiváljuk',
            'Hozzájárulását bármikor módosíthatja vagy visszavonhatja' => 'Hozzájárulásodat bármikor módosíthatod vagy visszavonhatod',
            'A sütiket a böngészője beállításaiban is törölheti vagy letilthatja.' => 'A sütiket a böngésződ beállításaiban is törölheted vagy letilthatod.',
        ],
    ];

    public function up(): void
    {
        foreach (self::REPLACEMENTS as $key => $replacements) {
            $query = DB::table('site_settings')->where('group', LegalPageContent::GROUP)->where('key', $key);
            $html = $query->value('value');

            if (! is_string($html)) {
                continue;
            }

            $query->update([
                'value' => strtr($html, $replacements),
                'updated_at' => now(),
            ]);
        }

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        // Content update only.
    }
};
