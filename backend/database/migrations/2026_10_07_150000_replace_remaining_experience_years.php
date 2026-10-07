<?php

use App\Models\PortfolioContentBlock;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The agency started in 2003. The stored site content still spoke of "15 év",
 * "15 éve" and "egy évtizede" in several places (trust stats, why-choose-us
 * features, story quote); every one of them becomes 22+ years. Legal texts are
 * left alone: their "15 nap" deadlines are not about experience.
 */
return new class extends Migration
{
    /**
     * @var array<string, string> pattern => replacement
     */
    private const TEXT_RULES = [
        '/\b15\+? év tapasztalat/u' => '22+ év tapasztalat',
        '/\b15 éve\b/u' => '22 éve',
        '/\begy évtizede\b/u' => '22 éve',
    ];

    public function up(): void
    {
        PortfolioContentBlock::query()->get()->each(function (PortfolioContentBlock $block): void {
            $block->value = $this->replaced($block->value);
            $block->draft_value = $this->replaced($block->draft_value);
            $block->value_json = $this->replaced($block->value_json);
            $block->draft_value_json = $this->replaced($block->draft_value_json);

            if ($block->isDirty()) {
                $block->save();
            }
        });

        DB::table('site_settings')->where('group', '!=', 'legal')->get(['id', 'value'])
            ->each(function (object $setting): void {
                $value = $this->replaced($setting->value);

                if ($value !== $setting->value) {
                    DB::table('site_settings')->where('id', $setting->id)->update(['value' => $value]);
                }
            });

        PublicContentCache::bump(PublicContentCache::HOMEPAGE_CONTENT, PublicContentCache::SITE_SETTINGS);
    }

    public function down(): void
    {
        // Content update only.
    }

    /**
     * Applies the text rules to a string, or recursively to a JSON structure, where an
     * experience stat stored as a number ({value: 15, suffix: " év"}) becomes 22+.
     */
    private function replaced(mixed $value): mixed
    {
        if (is_string($value)) {
            return preg_replace(array_keys(self::TEXT_RULES), array_values(self::TEXT_RULES), $value);
        }

        if (! is_array($value)) {
            return $value;
        }

        if (($value['value'] ?? null) === 15 && str_contains(mb_strtolower((string) ($value['label'] ?? '')), 'tapasztalat')) {
            $value['value'] = 22;
            $value['suffix'] = '+ év';
        }

        return array_map(fn (mixed $item): mixed => $this->replaced($item), $value);
    }
};
