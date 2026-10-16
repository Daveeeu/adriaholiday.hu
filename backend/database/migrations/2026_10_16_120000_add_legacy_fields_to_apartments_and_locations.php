<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * What the legacy adriaholiday.hu apartment pages show, so the legacy
 * apartment import (adria:apartments:import) can carry them over and the
 * public apartment pages can show them:
 *
 * - apartments: the legacy record id, the distances to the centre and the
 *   sea, the SEO fields and the legacy values without a column of their own.
 *   Their images become gallery items of library media (like a tour's), so
 *   the old per-apartment Gallery link becomes optional. Codes are not
 *   unique in the legacy data (one building's apartments share one, e.g.
 *   "768"), so the code is only indexed.
 * - locations: the legacy place id, the area of the legacy URL
 *   (/apartmanok/{area}/{location}), the location guide shown under the
 *   apartment list, the information block shown on every apartment page
 *   there, and the SEO fields.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('apartments', function (Blueprint $table): void {
            $table->unsignedInteger('legacy_id')->nullable()->unique()->after('id');
            $table->unsignedInteger('distance_to_center_m')->nullable()->after('size_m2');
            $table->unsignedInteger('distance_to_sea_m')->nullable()->after('distance_to_center_m');
            $table->string('seo_title')->nullable()->after('seo_auto_generate');
            $table->text('seo_description')->nullable()->after('seo_title');
            $table->string('seo_robots')->nullable()->after('seo_description');
            $table->json('legacy_attributes')->nullable()->after('services');
            $table->dropUnique(['code']);
            $table->index('code');
            $table->dropForeign(['gallery_id']);
        });

        Schema::table('apartments', function (Blueprint $table): void {
            $table->foreignId('gallery_id')->nullable()->change();
            $table->foreign('gallery_id')->references('id')->on('galleries')->nullOnDelete();
        });

        Schema::create('apartment_gallery_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('apartment_id')->constrained('apartments')->cascadeOnDelete();
            $table->foreignId('media_id')->constrained('media')->cascadeOnDelete();
            $table->unsignedInteger('legacy_image_id')->nullable()->index();
            $table->string('title')->nullable();
            $table->string('alt')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
            $table->index(['apartment_id', 'sort_order']);
        });

        Schema::table('locations', function (Blueprint $table): void {
            $table->unsignedInteger('legacy_id')->nullable()->unique()->after('id');
            $table->string('area_slug')->nullable()->index()->after('slug');
            $table->string('area_name')->nullable()->after('area_slug');
            $table->longText('guide')->nullable()->after('description');
            $table->longText('apartment_information')->nullable()->after('guide');
            $table->string('seo_title')->nullable()->after('apartment_information');
            $table->text('seo_description')->nullable()->after('seo_title');
            $table->string('seo_robots')->nullable()->after('seo_description');
        });
    }

    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table): void {
            $table->dropUnique(['legacy_id']);
            $table->dropIndex(['area_slug']);
            $table->dropColumn(['legacy_id', 'area_slug', 'area_name', 'guide', 'apartment_information', 'seo_title', 'seo_description', 'seo_robots']);
        });

        Schema::dropIfExists('apartment_gallery_items');

        Schema::table('apartments', function (Blueprint $table): void {
            $table->dropForeign(['gallery_id']);
            $table->dropIndex(['code']);
            $table->unique('code');
            $table->dropUnique(['legacy_id']);
            $table->dropColumn(['legacy_id', 'distance_to_center_m', 'distance_to_sea_m', 'seo_title', 'seo_description', 'seo_robots', 'legacy_attributes']);
        });

        Schema::table('apartments', function (Blueprint $table): void {
            $table->foreignId('gallery_id')->nullable(false)->change();
            $table->foreign('gallery_id')->references('id')->on('galleries')->cascadeOnDelete();
        });
    }
};
