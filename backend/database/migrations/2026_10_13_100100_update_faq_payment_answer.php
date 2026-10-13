<?php

use App\Models\PortfolioContentBlock;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;

/**
 * The FAQ promised a flat 30% deposit; payments now follow the instalment rules
 * of BookingPaymentSchedule. An answer the office already rewrote is kept.
 */
return new class extends Migration
{
    private const KEY = 'home.faq.items';

    private const OLD_ANSWER = 'A foglaláskor 30% előleget kell fizetni, a fennmaradó összeget pedig legkésőbb 30 nappal az indulás előtt.';

    private const NEW_ANSWER = 'Foglaláskor előleget fizetsz: az indulás előtt 120 napnál korábban 20%-ot, 35–120 nappal előtte 40%-ot (a biztosítással együtt, 48 órán belül), a hátralékot legkésőbb 30–35 nappal az indulás előtt. 35 napon belüli indulásnál a teljes összeget 24 órán belül kell befizetni.';

    public function up(): void
    {
        $block = PortfolioContentBlock::query()->where('key', self::KEY)->first();
        $items = $block?->value_json;

        if (! is_array($items)) {
            return;
        }

        $updated = array_map(
            fn (mixed $item): mixed => is_array($item) && ($item['answer'] ?? null) === self::OLD_ANSWER ? [...$item, 'answer' => self::NEW_ANSWER] : $item,
            $items,
        );

        if ($updated !== $items) {
            $block->update(['value_json' => $updated]);
            PublicContentCache::bump(PublicContentCache::HOMEPAGE_CONTENT);
        }
    }

    public function down(): void
    {
        // Content update only.
    }
};
