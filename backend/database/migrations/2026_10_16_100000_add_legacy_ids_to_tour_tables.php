<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The legacy adriaholiday.hu admin's record ids, so the legacy catalog import
 * (adria:catalog:import) finds the records it wrote before instead of
 * creating them again. Gallery items also learn which gallery of the legacy
 * offer they belong to ("main" or the offer's "intro" gallery).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->unsignedInteger('legacy_id')->nullable()->unique()->after('id');
        });

        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->unsignedInteger('legacy_id')->nullable()->unique()->after('id');
        });

        Schema::table('tour_departure_places', function (Blueprint $table): void {
            $table->unsignedInteger('legacy_id')->nullable()->unique()->after('id');
        });

        Schema::table('tour_date_extras', function (Blueprint $table): void {
            $table->unsignedInteger('legacy_id')->nullable()->index()->after('id');
        });

        Schema::table('tour_partner_bonuses', function (Blueprint $table): void {
            $table->unsignedInteger('legacy_id')->nullable()->index()->after('id');
        });

        Schema::table('tour_gallery_items', function (Blueprint $table): void {
            $table->string('collection', 32)->default('main')->after('media_id');
            $table->unsignedInteger('legacy_image_id')->nullable()->after('collection');
            $table->index(['tour_id', 'collection']);
        });
    }

    public function down(): void
    {
        Schema::table('tour_gallery_items', function (Blueprint $table): void {
            $table->dropIndex(['tour_id', 'collection']);
            $table->dropColumn(['collection', 'legacy_image_id']);
        });

        foreach (['tour_partner_bonuses', 'tour_date_extras'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropIndex(['legacy_id']);
                $table->dropColumn('legacy_id');
            });
        }

        foreach (['tour_departure_places', 'tour_dates', 'tours'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->dropUnique(['legacy_id']);
                $table->dropColumn('legacy_id');
            });
        }
    }
};
