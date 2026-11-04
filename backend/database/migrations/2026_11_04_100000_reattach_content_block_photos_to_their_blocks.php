<?php

use App\Models\PortfolioContentBlock;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * A content block finds its photo by a media collection named after its key
 * ("{key}.published" / "{key}.draft"). Reordering the about page team renamed
 * the photo blocks but left their media in the collections of the old keys, so
 * every team portrait disappeared. This points each block's media back at the
 * collections of the key the block has now.
 */
return new class extends Migration
{
    public function up(): void
    {
        $blockKeys = DB::table('portfolio_content_blocks')->pluck('key', 'id');

        $media = DB::table('media')
            ->where('model_type', PortfolioContentBlock::class)
            ->get(['id', 'model_id', 'collection_name']);

        foreach ($media as $item) {
            $key = $blockKeys[$item->model_id] ?? null;

            if ($key === null || ! preg_match('/\.(draft|published)$/', $item->collection_name, $match)) {
                continue;
            }

            $collection = "{$key}.{$match[1]}";

            if ($collection !== $item->collection_name) {
                DB::table('media')->where('id', $item->id)->update(['collection_name' => $collection]);
            }
        }

        PublicContentCache::bump(PublicContentCache::HOMEPAGE_CONTENT);
    }

    public function down(): void
    {
        // Data repair only.
    }
};
