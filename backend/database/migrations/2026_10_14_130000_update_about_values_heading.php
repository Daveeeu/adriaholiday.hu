<?php

use App\Models\PortfolioContentBlock;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;

/**
 * The Rólunk page's values heading reads "Amit tőlünk kapsz" instead of
 * "Amit velünk kapsz". A heading the office already rewrote is kept.
 */
return new class extends Migration
{
    private const KEY = 'about.values.titleParts';

    private const OLD_TEXT = 'Amit velünk';

    private const NEW_TEXT = 'Amit tőlünk';

    public function up(): void
    {
        $block = PortfolioContentBlock::query()->where('key', self::KEY)->first();

        if (! $block) {
            return;
        }

        $changes = array_filter([
            'value_json' => $this->renamed($block->value_json),
            'draft_value_json' => $this->renamed($block->draft_value_json),
        ], fn (?array $value): bool => $value !== null);

        if ($changes !== []) {
            $block->update($changes);
            PublicContentCache::bump(PublicContentCache::HOMEPAGE_CONTENT);
        }
    }

    public function down(): void
    {
        // Content update only.
    }

    /**
     * The heading with its old wording replaced, or null when there is nothing to change.
     *
     * @return array<string, mixed>|null
     */
    private function renamed(mixed $heading): ?array
    {
        if (! is_array($heading) || ! is_array($heading['titleParts'] ?? null)) {
            return null;
        }

        $parts = array_map(
            fn (mixed $part): mixed => is_array($part) && ($part['text'] ?? null) === self::OLD_TEXT ? [...$part, 'text' => self::NEW_TEXT] : $part,
            $heading['titleParts'],
        );

        return $parts !== $heading['titleParts'] ? [...$heading, 'titleParts' => $parts] : null;
    }
};
