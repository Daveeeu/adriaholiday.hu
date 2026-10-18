<?php

use App\Support\CompanyYears;
use App\Support\LegalPageContent;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The site's "23 years" become the "{evek}" placeholder, which every page
 * fills in with the full years since the founding day (2003-08-27), so the
 * copy never needs updating again.
 */
return new class extends Migration
{
    private const REPLACEMENTS = [
        '/(?<![\d{])23\+(?= ?év)/u' => CompanyYears::PLACEHOLDER.'+',
        '/^23\+$/u' => CompanyYears::PLACEHOLDER.'+',
        '/(?<!\d)23 éve\b/u' => CompanyYears::PLACEHOLDER.' éve',
        '/^23 év,$/u' => CompanyYears::PLACEHOLDER.' év,',
        '/(?<!\d)23 év után is/u' => CompanyYears::PLACEHOLDER.' év után is',
        '/Több mint 23 év tapasztalata/u' => 'Több mint '.CompanyYears::PLACEHOLDER.' év tapasztalata',
    ];

    public function up(): void
    {
        DB::table('portfolio_content_blocks')->get(['id', 'value', 'draft_value', 'value_json', 'draft_value_json'])
            ->each(function (object $block): void {
                $changes = array_filter([
                    'value' => $this->rewriteText($block->value),
                    'draft_value' => $this->rewriteText($block->draft_value),
                    'value_json' => $this->rewriteJson($block->value_json),
                    'draft_value_json' => $this->rewriteJson($block->draft_value_json),
                ], static fn (?string $value) => $value !== null);

                if ($changes !== []) {
                    DB::table('portfolio_content_blocks')->where('id', $block->id)->update($changes);
                }
            });

        DB::table('site_settings')
            ->where(fn ($query) => $query
                ->where(fn ($q) => $q->where('group', 'footer')->where('key', 'description'))
                ->orWhere(fn ($q) => $q->where('group', LegalPageContent::GROUP)->where('key', 'contact_content')))
            ->get(['id', 'value'])
            ->each(function (object $setting): void {
                $value = $this->rewriteText($setting->value);

                if ($value !== null) {
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
     * The rewritten text, or null when nothing changed.
     */
    private function rewriteText(?string $text): ?string
    {
        if ($text === null) {
            return null;
        }

        $rewritten = preg_replace(array_keys(self::REPLACEMENTS), array_values(self::REPLACEMENTS), $text);

        return $rewritten !== $text ? $rewritten : null;
    }

    /**
     * The rewritten JSON, or null when nothing changed. The numeric years stat
     * ({"value": 23, "suffix": "+ év"}) becomes the placeholder, which the
     * site counts up as the number.
     */
    private function rewriteJson(?string $json): ?string
    {
        $data = $json !== null ? json_decode($json, true) : null;

        if (! is_array($data)) {
            return null;
        }

        $rewritten = $this->rewriteNode($data);

        return $rewritten !== $data ? json_encode($rewritten) : null;
    }

    private function rewriteNode(mixed $node): mixed
    {
        if (is_string($node)) {
            return $this->rewriteText($node) ?? $node;
        }

        if (! is_array($node)) {
            return $node;
        }

        if (($node['value'] ?? null) === 23 && str_contains((string) ($node['suffix'] ?? ''), 'év')) {
            $node['value'] = CompanyYears::PLACEHOLDER;
        }

        return array_map(fn (mixed $child) => $this->rewriteNode($child), $node);
    }
};
