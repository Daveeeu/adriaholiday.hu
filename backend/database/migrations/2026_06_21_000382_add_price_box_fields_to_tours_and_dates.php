<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->decimal('price_box_price', 12, 2)->nullable()->after('price');
            $table->string('price_box_displayed_price')->nullable()->after('price_box_price');
            $table->string('price_box_currency', 8)->nullable()->after('price_box_displayed_price');
            $table->string('price_box_price_suffix', 32)->nullable()->after('price_box_currency');
            $table->string('price_box_discount_badge', 32)->nullable()->after('price_box_price_suffix');
            $table->string('price_box_discount_text', 255)->nullable()->after('price_box_discount_badge');
            $table->string('price_box_urgency_text', 255)->nullable()->after('price_box_discount_text');
            $table->string('price_box_rating_text', 255)->nullable()->after('price_box_urgency_text');
            $table->unsignedInteger('price_box_min_participants')->nullable()->after('price_box_rating_text');
            $table->unsignedInteger('price_box_max_participants')->nullable()->after('price_box_min_participants');
            $table->unsignedInteger('price_box_available_seats')->nullable()->after('price_box_max_participants');
            $table->unsignedInteger('price_box_capacity')->nullable()->after('price_box_available_seats');
            $table->string('price_box_cta_primary_label', 255)->nullable()->after('price_box_capacity');
            $table->string('price_box_cta_secondary_label', 255)->nullable()->after('price_box_cta_primary_label');
        });

        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->decimal('price_box_price', 12, 2)->nullable()->after('price');
            $table->string('price_box_displayed_price')->nullable()->after('price_box_price');
            $table->string('price_box_discount_badge', 32)->nullable()->after('price_box_displayed_price');
            $table->unsignedInteger('price_box_min_participants')->nullable()->after('price_box_discount_badge');
            $table->unsignedInteger('price_box_max_participants')->nullable()->after('price_box_min_participants');
            $table->unsignedInteger('price_box_available_seats')->nullable()->after('price_box_max_participants');
            $table->unsignedInteger('price_box_capacity')->nullable()->after('price_box_available_seats');
        });
    }

    public function down(): void
    {
        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->dropColumn([
                'price_box_price',
                'price_box_displayed_price',
                'price_box_discount_badge',
                'price_box_min_participants',
                'price_box_max_participants',
                'price_box_available_seats',
                'price_box_capacity',
            ]);
        });

        Schema::table('tours', function (Blueprint $table): void {
            $table->dropColumn([
                'price_box_price',
                'price_box_displayed_price',
                'price_box_currency',
                'price_box_price_suffix',
                'price_box_discount_badge',
                'price_box_discount_text',
                'price_box_urgency_text',
                'price_box_rating_text',
                'price_box_min_participants',
                'price_box_max_participants',
                'price_box_available_seats',
                'price_box_capacity',
                'price_box_cta_primary_label',
                'price_box_cta_secondary_label',
            ]);
        });
    }
};
