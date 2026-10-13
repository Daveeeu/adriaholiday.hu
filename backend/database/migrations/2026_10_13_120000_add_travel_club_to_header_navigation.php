<?php

use App\Models\SiteSetting;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;

/**
 * The header links the travel club page, before "Kapcsolat" (or last); a menu
 * that already links it is left alone.
 */
return new class extends Migration
{
    private const LINK = ['label' => 'Utazási Klub', 'to' => '/utazasi-klub'];

    public function up(): void
    {
        $setting = SiteSetting::query()->where('group', 'header')->where('key', 'navigation')->first();
        $items = $setting?->decodedValue();

        if (! is_array($items) || in_array(self::LINK['to'], array_column($items, 'to'), true)) {
            return;
        }

        $contactIndex = array_search('/kapcsolat', array_column($items, 'to'), true);
        array_splice($items, $contactIndex === false ? count($items) : $contactIndex, 0, [self::LINK]);

        $setting->update(['value' => SiteSetting::encodeValue('json', $items)]);
        PublicContentCache::bump(PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        // Content update only.
    }
};
