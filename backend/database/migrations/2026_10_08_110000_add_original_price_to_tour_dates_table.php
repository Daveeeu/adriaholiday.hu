<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A date on promotion keeps its pre-promotion price, shown struck through
 * next to the bookable price, and a date can carry a short label shown with
 * its price ("Előfoglalási akció", "Őszi szünet"), like on the legacy site.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->decimal('price_box_original_price', 12, 2)->nullable()->after('price_box_price');
            $table->string('price_box_label')->nullable()->after('price_box_discount_badge');
        });
    }

    public function down(): void
    {
        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->dropColumn(['price_box_original_price', 'price_box_label']);
        });
    }
};
