<?php

namespace App\Services\Legacy\Catalog;

use App\Support\PrivateReport;

/**
 * Writes a legacy import report next to the application's private files
 * (storage/app/private/legacy-import): the whole report as JSON and one CSV
 * line per record (an offer by default) for a spreadsheet.
 */
final class LegacyCatalogReport
{
    private const DIRECTORY = 'legacy-import';

    /** The CSV columns of an offer report. */
    public const OFFER_COLUMNS = [
        'legacy_id', 'slug', 'name', 'legacy_active', 'action', 'tour_id', 'archive', 'bookings_on_tour', 'manual_review',
        'dates', 'upcoming_dates', 'bookable_upcoming_dates', 'dates_with_own_stay', 'extras', 'extras_paid_on_site',
        'departure_places', 'new_departure_places', 'gallery_images', 'media_files', 'media_mirrored',
        'categories', 'countries', 'country_source', 'unmapped', 'review_reasons',
    ];

    public function __construct(private readonly PrivateReport $report) {}

    /**
     * @param  array<string, mixed>  $summary
     * @param  array<int, array<string, mixed>>  $rows
     * @param  array<int, string>  $columns  of the CSV
     * @param  string  $rowsKey  the rows' key in the JSON report
     * @return array{json: string, csv: string} absolute paths
     */
    public function write(string $name, array $summary, array $rows, array $columns = self::OFFER_COLUMNS, string $rowsKey = 'offers'): array
    {
        return $this->report->write(self::DIRECTORY, $name, $summary, $rows, $columns, $rowsKey);
    }
}
