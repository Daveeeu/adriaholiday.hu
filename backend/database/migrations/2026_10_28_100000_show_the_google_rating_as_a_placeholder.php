<?php

use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The home page's rating stats showed an invented 4.9; they become the
 * "{ertekeles}" placeholder, which the site fills in with the agency's real
 * Google rating, so the figure is kept in one place.
 */
return new class extends Migration
{
    private const PLACEHOLDER = '{ertekeles}';

    private const STAT_KEYS = ['home.hero.stats', 'home.experience.stats', 'home.trust.stats'];

    public function up(): void
    {
        DB::table('portfolio_content_blocks')->whereIn('key', self::STAT_KEYS)
            ->get(['id', 'value_json', 'draft_value_json'])
            ->each(function (object $block): void {
                $changes = array_filter([
                    'value_json' => $this->rewriteJson($block->value_json),
                    'draft_value_json' => $this->rewriteJson($block->draft_value_json),
                ], static fn (?string $value) => $value !== null);

                if ($changes !== []) {
                    DB::table('portfolio_content_blocks')->where('id', $block->id)->update($changes);
                }
            });

        PublicContentCache::bump(PublicContentCache::HOMEPAGE_CONTENT);
    }

    public function down(): void
    {
        // Content update only.
    }

    /**
     * The rewritten stats, or null when nothing changed.
     */
    private function rewriteJson(?string $json): ?string
    {
        $stats = $json !== null ? json_decode($json, true) : null;

        if (! is_array($stats)) {
            return null;
        }

        $rewritten = array_map(fn (mixed $stat): mixed => $this->rewriteStat($stat), $stats);

        return $rewritten !== $stats ? json_encode($rewritten) : null;
    }

    /**
     * A rating stat's "4.9" (or "4.9/5", or the number 4.9) as the placeholder.
     */
    private function rewriteStat(mixed $stat): mixed
    {
        if (! is_array($stat) || ! str_contains(mb_strtolower((string) ($stat['label'] ?? '')), 'értékelés')) {
            return $stat;
        }

        $value = preg_replace('/^\d[.,]\d(?=\/5$|$)/u', self::PLACEHOLDER, (string) ($stat['value'] ?? ''));

        return $value !== null && $value !== (string) ($stat['value'] ?? '') ? [...$stat, 'value' => $value] : $stat;
    }
};
