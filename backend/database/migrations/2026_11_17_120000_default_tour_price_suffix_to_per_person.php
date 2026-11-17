<?php

use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Tour prices are per person: a tour's price suffix is "/ fő" unless the
 * office writes another, so the tours imported without one get it too.
 */
return new class extends Migration
{
    private const PER_PERSON = '/ fő';

    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->string('price_box_price_suffix', 32)->nullable()->default(self::PER_PERSON)->change();
        });

        DB::table('tours')
            ->where(fn ($query) => $query->whereNull('price_box_price_suffix')->orWhere('price_box_price_suffix', ''))
            ->update(['price_box_price_suffix' => self::PER_PERSON]);

        PublicContentCache::bump(PublicContentCache::OFFERS);
    }

    public function down(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->string('price_box_price_suffix', 32)->nullable()->default(null)->change();
        });
    }
};
