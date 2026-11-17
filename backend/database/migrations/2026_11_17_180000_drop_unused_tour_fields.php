<?php

use App\Support\PublicContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The tour fields nothing reads any more, hidden from the admin on 2026-11-17
 * and now deleted: the legacy site's image offer, slider, action lines,
 * program PDF, call to action labels, region, seasonal and homepage offer
 * groups, FIT, difficulty, partner offer flag, minimum headcount and partner
 * bonuses. The recommended flag stays: it orders the featured offers.
 *
 * The foreign key and the indexes on these columns go first, looked up by
 * the names the database actually has: the homepage offer's foreign key and
 * its index are named "1" on MySQL and MariaDB (the add migration chained
 * index() onto the foreign key) and do not exist under any name on SQLite.
 */
return new class extends Migration
{
    /** Indexed boolean columns, false by default. */
    private const FLAG_COLUMNS = ['partner_offer', 'image_offer', 'slider_image_enabled', 'slider_text_enabled'];

    /** Indexed reference columns. */
    private const REFERENCE_COLUMNS = ['group_id', 'seasonal_group_id', 'fit_id', 'difficulty_id'];

    /** Columns without an index. */
    private const PLAIN_COLUMNS = [
        'action1',
        'action2',
        'program_pdf_path',
        'program_pdf_file',
        'slider_image',
        'price_box_min_participants',
        'price_box_cta_primary_label',
        'price_box_cta_secondary_label',
    ];

    public function up(): void
    {
        $columns = ['homepage_offer_id', ...self::FLAG_COLUMNS, ...self::REFERENCE_COLUMNS, ...self::PLAIN_COLUMNS];
        $covers = fn (array $key): bool => array_intersect($key['columns'], $columns) !== [];

        $foreignKeys = array_values(array_filter(Schema::getForeignKeys('tours'), $covers));

        Schema::table('tours', function (Blueprint $table) use ($foreignKeys): void {
            foreach ($foreignKeys as $foreignKey) {
                // SQLite foreign keys have no name; they are found by column.
                $table->dropForeign($foreignKey['name'] ?? $foreignKey['columns']);
            }
        });

        $indexes = array_values(array_filter(
            Schema::getIndexes('tours'),
            fn (array $index): bool => ! $index['primary'] && $covers($index),
        ));

        Schema::table('tours', function (Blueprint $table) use ($indexes): void {
            foreach ($indexes as $index) {
                $table->dropIndex($index['name']);
            }
        });

        Schema::table('tours', function (Blueprint $table) use ($columns): void {
            $table->dropColumn($columns);
        });

        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->dropColumn('price_box_min_participants');
        });

        Schema::dropIfExists('tour_partner_bonuses');

        PublicContentCache::bump(PublicContentCache::OFFERS);
    }

    /**
     * The columns and the table come back empty: the values are gone.
     */
    public function down(): void
    {
        Schema::create('tour_partner_bonuses', function (Blueprint $table): void {
            $table->id();
            $table->unsignedInteger('legacy_id')->nullable()->index();
            $table->foreignId('tour_id')->constrained('tours')->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->string('label');
            $table->string('value')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->unsignedInteger('price_box_min_participants')->nullable();
        });

        Schema::table('tours', function (Blueprint $table): void {
            foreach (self::FLAG_COLUMNS as $column) {
                $table->boolean($column)->default(false)->index();
            }

            foreach (self::REFERENCE_COLUMNS as $column) {
                $table->string($column)->nullable()->index();
            }

            $table->foreignId('homepage_offer_id')->nullable()->constrained('homepage_offers')->nullOnDelete()->index();
            $table->string('action1')->nullable();
            $table->string('action2')->nullable();
            $table->string('program_pdf_path')->nullable();
            $table->string('program_pdf_file')->nullable();
            $table->string('slider_image')->nullable();
            $table->unsignedInteger('price_box_min_participants')->nullable();
            $table->string('price_box_cta_primary_label')->nullable();
            $table->string('price_box_cta_secondary_label')->nullable();
        });
    }
};
