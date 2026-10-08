<?php

use App\Support\LegalPageContent;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The agency has been organising trips since 2003, so the site's copy says
 * 23+ years everywhere instead of the mixed 20, 22 and "two decades".
 */
return new class extends Migration
{
    private const REPLACEMENTS = [
        '/\b2[02]\+(?= ?év)/u' => '23+',
        '/^2[02]\+$/u' => '23+',
        '/(?<!\d)2[02] éve\b/u' => '23 éve',
        '/két évtizede ehhez tartjuk magunkat/u' => '23 éve ehhez tartjuk magunkat',
        '/^Két évtized,$/u' => '23 év,',
        '/két évtized után is/u' => '23 év után is',
        '/Több mint két évtized tapasztalata/u' => 'Több mint 23 év tapasztalata',
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
     * The rewritten JSON, or null when nothing changed. A numeric "22" stat with
     * a years suffix ({"value": 22, "suffix": "+ év"}) becomes 23 as well.
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

        if (in_array($node['value'] ?? null, [20, 22], true) && str_contains((string) ($node['suffix'] ?? ''), 'év')) {
            $node['value'] = 23;
        }

        return array_map(fn (mixed $child) => $this->rewriteNode($child), $node);
    }
};
