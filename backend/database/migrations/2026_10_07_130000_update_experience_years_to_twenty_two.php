<?php

use App\Models\PortfolioContentBlock;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;

/**
 * The agency started in 2003: the home page's "years of experience" figures,
 * still showing 15 in the stored content, become "22+" everywhere.
 */
return new class extends Migration
{
    private const YEARS = '22+';

    private const STAT_KEYS = ['home.hero.stats', 'home.experience.stats'];

    public function up(): void
    {
        PortfolioContentBlock::query()->whereIn('key', self::STAT_KEYS)->get()
            ->each(function (PortfolioContentBlock $block): void {
                $block->value_json = $this->updatedStats($block->value_json);
                $block->draft_value_json = $this->updatedStats($block->draft_value_json);
                $block->save();
            });

        PortfolioContentBlock::query()->where('key', 'home.footer.description')->get()
            ->each(function (PortfolioContentBlock $block): void {
                $block->value = $this->updatedText($block->value);
                $block->draft_value = $this->updatedText($block->draft_value);
                $block->save();
            });

        PublicContentCache::bump(PublicContentCache::HOMEPAGE_CONTENT);
    }

    public function down(): void
    {
        // Content update only.
    }

    private function updatedStats(mixed $stats): mixed
    {
        if (! is_array($stats)) {
            return $stats;
        }

        return array_map(
            fn (mixed $stat): mixed => is_array($stat) && str_contains(mb_strtolower((string) ($stat['label'] ?? '')), 'tapasztalat')
                ? [...$stat, 'value' => self::YEARS]
                : $stat,
            $stats,
        );
    }

    private function updatedText(?string $text): ?string
    {
        return $text === null ? null : (string) preg_replace('/\b15\+? év tapasztalat/u', self::YEARS.' év tapasztalat', $text);
    }
};
