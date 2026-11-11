<?php

use App\Support\PlainText;
use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * A tour's short description is the plain route line under its name on the
 * offer cards and the tour page; some still held HTML ("<p>Krakkó-…</p>"),
 * which the site printed as text. The Tour model keeps new saves plain.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('tours')
            ->where('short_description', 'like', '%<%')
            ->orWhere('short_description', 'like', '%&%')
            ->get(['id', 'short_description'])
            ->each(fn (object $tour) => DB::table('tours')
                ->where('id', $tour->id)
                ->update(['short_description' => PlainText::line($tour->short_description)]));

        PublicContentCache::bump(PublicContentCache::OFFERS, PublicContentCache::PARTNER_XML);
    }

    public function down(): void
    {
        // Content update only.
    }
};
