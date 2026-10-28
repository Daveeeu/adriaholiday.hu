<?php

use App\Support\CompanyYears;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The years placeholder already counts the full years since the founding
 * day, so "Több mint {evek} éve szervezünk utazásokat" overstated it: the
 * home page's trust stat says "{evek} éve szervezünk utazásokat".
 */
return new class extends Migration
{
    private const FROM = 'Több mint '.CompanyYears::PLACEHOLDER.' éve szervezünk utazásokat';

    private const TO = CompanyYears::PLACEHOLDER.' éve szervezünk utazásokat';

    public function up(): void
    {
        DB::table('portfolio_content_blocks')->where('key', 'home.trust.stats')
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

        $rewritten = array_map(
            static fn (mixed $stat): mixed => is_array($stat) && is_string($stat['description'] ?? null)
                ? [...$stat, 'description' => str_replace(self::FROM, self::TO, $stat['description'])]
                : $stat,
            $stats,
        );

        return $rewritten !== $stats ? json_encode($rewritten) : null;
    }
};
