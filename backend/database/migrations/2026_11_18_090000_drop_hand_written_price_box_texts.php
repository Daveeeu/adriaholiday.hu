<?php

use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The price box texts the office no longer writes: the displayed price (the
 * site writes it from the price), the urgency text (the trip page's toast
 * only warns about the last free seats, in its own words) and the rating
 * text. Every stored displayed price was the price formatted, so nothing the
 * visitors see is lost.
 */
return new class extends Migration
{
    private const TOUR_COLUMNS = ['displayed_price', 'price_box_displayed_price', 'price_box_urgency_text', 'price_box_rating_text'];

    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->dropColumn(self::TOUR_COLUMNS);
        });

        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->dropColumn('price_box_displayed_price');
        });

        PublicContentCache::bump(PublicContentCache::OFFERS);
    }

    /**
     * The columns come back empty.
     */
    public function down(): void
    {
        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->string('price_box_displayed_price')->nullable();
        });

        Schema::table('tours', function (Blueprint $table): void {
            foreach (self::TOUR_COLUMNS as $column) {
                $table->string($column)->nullable();
            }
        });
    }
};
