<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Fields the legacy offers have and the new site lacked:
 *  - tours: the text under the program, the offer's own SEO title,
 *    description and robots, the featured subtitle, and legacy_attributes for
 *    information without a function here (XML feed fields, original status…);
 *  - tour_dates: accommodation and meals of one date when they differ from
 *    the tour's (null: the tour's), and the date's legacy_attributes;
 *  - tour_date_extras: the currency of a fee paid on site in another
 *    currency (e.g. a city tax in EUR), never added to the forint total.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->longText('program_footer')->nullable()->after('program');
            $table->string('seo_title')->nullable()->after('seo_auto_generate');
            $table->text('seo_description')->nullable()->after('seo_title');
            $table->string('seo_robots', 64)->nullable()->after('seo_description');
            $table->string('featured_subtitle')->nullable()->after('featured_order');
            $table->json('legacy_attributes')->nullable();
        });

        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->string('accommodation')->nullable()->after('status');
            $table->text('accommodation_info')->nullable()->after('accommodation');
            $table->string('catering')->nullable()->after('accommodation_info');
            $table->text('catering_info')->nullable()->after('catering');
            $table->json('legacy_attributes')->nullable();
        });

        Schema::table('tour_date_extras', function (Blueprint $table): void {
            $table->char('currency', 3)->default('HUF')->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('tour_date_extras', function (Blueprint $table): void {
            $table->dropColumn('currency');
        });

        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->dropColumn(['accommodation', 'accommodation_info', 'catering', 'catering_info', 'legacy_attributes']);
        });

        Schema::table('tours', function (Blueprint $table): void {
            $table->dropColumn(['program_footer', 'seo_title', 'seo_description', 'seo_robots', 'featured_subtitle', 'legacy_attributes']);
        });
    }
};
