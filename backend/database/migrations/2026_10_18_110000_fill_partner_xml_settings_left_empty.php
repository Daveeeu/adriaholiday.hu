<?php

use App\Models\Tour;
use App\Support\PartnerXml\LegacyPartnerXmlSettings;
use App\Support\PartnerXml\PartnerXmlSettings;
use Illuminate\Database\Migrations\Migration;

/**
 * The partner XML settings migration ran on production with the previous
 * release's cached config (the container migrated before caching its own),
 * so the settings read from config/partner_xml.php — the legacy region and
 * each partner's travel type — stayed empty. They are filled from the
 * legacy data where still empty; anything set since is kept.
 */
return new class extends Migration
{
    public function up(): void
    {
        Tour::withTrashed()->whereNotNull('legacy_attributes')->each(function (Tour $tour): void {
            $legacy = $tour->legacy_attributes ?? [];
            $current = PartnerXmlSettings::normalize($tour->partner_xml);
            $imported = LegacyPartnerXmlSettings::forTour(
                is_array($legacy['extra_fields'] ?? null) ? $legacy['extra_fields'] : [],
                is_array($legacy['regions'] ?? null) ? array_values($legacy['regions']) : [],
            );

            if ($current['country_id'] === null) {
                $current['country_id'] = $imported['country_id'];
                $current['country_name'] = $imported['country_name'];
            }

            foreach ($current['travel_types'] as $partner => $value) {
                if ($value === null || $value === []) {
                    $current['travel_types'][$partner] = $imported['travel_types'][$partner];
                }
            }

            $tour->forceFill(['partner_xml' => $current])->saveQuietly();
        });
    }

    public function down(): void
    {
        // A data repair only.
    }
};
