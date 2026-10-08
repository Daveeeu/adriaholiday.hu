<?php

use App\Models\PortfolioContentBlock;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;

/**
 * The hero subtitle now leads with city breaks, the agency's main offer.
 */
return new class extends Migration
{
    private const KEY = 'home.hero.subtitle';

    private const SUBTITLE = 'Városlátogatások, tengerparti utak és körutazások tapasztalt szervezéssel, kényelmes buszokkal.';

    public function up(): void
    {
        PortfolioContentBlock::query()->where('key', self::KEY)->update([
            'value' => self::SUBTITLE,
            'draft_value' => null,
            'is_published' => true,
        ]);

        PublicContentCache::bump(PublicContentCache::HOMEPAGE_CONTENT);
    }

    public function down(): void
    {
        // Content update only.
    }
};
