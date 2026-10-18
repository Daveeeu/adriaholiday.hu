<?php

use App\Models\Tour;
use App\Models\TourDate;
use App\Support\PartnerXml\LegacyPartnerXmlSettings;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * What the partner XML feeds (/xmltravel, /xmltravelmax, /xmlcesys, /xml)
 * need beyond a tour's own data: the tour's partner settings and, per date,
 * whether it is in the feeds and its Cesys accommodation. Imported tours and
 * dates get what the legacy admin had for them.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tours', function (Blueprint $table): void {
            $table->json('partner_xml')->nullable()->after('xml_enabled');
        });

        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->boolean('xml_enabled')->default(true)->after('status');
            $table->json('partner_xml')->nullable()->after('xml_enabled');
        });

        Tour::withTrashed()->whereNotNull('legacy_attributes')->each(function (Tour $tour): void {
            $legacy = $tour->legacy_attributes ?? [];

            $tour->forceFill(['partner_xml' => LegacyPartnerXmlSettings::forTour(
                is_array($legacy['extra_fields'] ?? null) ? $legacy['extra_fields'] : [],
                is_array($legacy['regions'] ?? null) ? array_values($legacy['regions']) : [],
            )])->saveQuietly();
        });

        TourDate::withTrashed()->whereNotNull('legacy_attributes')->each(function (TourDate $date): void {
            $date->forceFill(LegacyPartnerXmlSettings::forDate($date->legacy_attributes ?? []))->saveQuietly();
        });
    }

    public function down(): void
    {
        Schema::table('tour_dates', function (Blueprint $table): void {
            $table->dropColumn(['xml_enabled', 'partner_xml']);
        });

        Schema::table('tours', function (Blueprint $table): void {
            $table->dropColumn('partner_xml');
        });
    }
};
