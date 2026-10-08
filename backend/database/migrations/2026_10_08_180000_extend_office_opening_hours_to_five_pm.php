<?php

use App\Support\CompanyContact;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The office is open until 17:00 on weekdays, not 16:00.
 */
return new class extends Migration
{
    public function up(): void
    {
        $query = DB::table('site_settings')->where('group', CompanyContact::GROUP)->where('key', 'opening_hours');
        $hours = $query->value('value');

        if (! is_string($hours)) {
            return;
        }

        $query->update([
            'value' => str_replace('08:00–16:00', '08:00–17:00', $hours),
            'updated_at' => now(),
        ]);

        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        // Content update only.
    }
};
