<?php

use App\Models\BlogCategory;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The legacy importer stored its own category codes in tours.category_ids, while the
 * admin and the category listing pages use portfolio (blog) category ids, so imported
 * tours were missing from every category page. The codes become the matching ids.
 */
return new class extends Migration
{
    /**
     * Legacy importer category code => portfolio category name.
     */
    private const CATEGORY_NAMES = [
        'korutazas' => 'Körutazások',
        'tengerparti-udulesek' => 'Tengerpartok',
        'adventi-barangolasok' => 'Adventi barangolások',
    ];

    public function up(): void
    {
        $categoryIds = [];

        foreach (DB::table('tours')->orderBy('id')->get(['id', 'category_ids']) as $tour) {
            $codes = json_decode((string) $tour->category_ids, true);

            if (! is_array($codes) || array_intersect($codes, array_keys(self::CATEGORY_NAMES)) === []) {
                continue;
            }

            $linked = collect($codes)
                ->map(function (mixed $code) use (&$categoryIds): string {
                    $name = self::CATEGORY_NAMES[$code] ?? null;

                    if ($name === null) {
                        return (string) $code;
                    }

                    return $categoryIds[$code] ??= (string) BlogCategory::firstOrCreateForName($name)->id;
                })
                ->unique()
                ->values()
                ->all();

            DB::table('tours')->where('id', $tour->id)->update(['category_ids' => json_encode($linked)]);
        }

        PublicContentCache::bump(PublicContentCache::OFFERS, PublicContentCache::PORTFOLIO_FILTERS);
    }

    public function down(): void
    {
        // Data repair only: the unlinked codes are not worth restoring.
    }
};
