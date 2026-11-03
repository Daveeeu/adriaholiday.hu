<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\Booking;
use App\Models\LegacyImportRecord;
use App\Models\Tour;
use App\Support\Booking\TourInquiry;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use App\Support\Legacy\LegacyPassengerList;
use Illuminate\Database\Eloquent\Model;

/**
 * Legacy tour inquiries (group quotes asked for a tour) → tour inquiries, on
 * the tour of their legacy offer id. Marked contacted, no e-mails.
 *
 * @extends RecordStep<Booking>
 */
final class TourInquiryStep extends RecordStep
{
    use BuildsLegacyBookings;

    public function key(): string
    {
        return 'tour-inquiries';
    }

    protected function entity(): string
    {
        return LegacyImportRecord::TOUR_INQUIRY;
    }

    protected function modelClass(): string
    {
        return Booking::class;
    }

    protected function sources(): array
    {
        return ['management.inquiry'];
    }

    /**
     * An inquiry imported before its tour links to it once the tour is there.
     */
    protected function needsRefresh(Model $existing, LegacyAdminExportRecord $record): bool
    {
        $offerId = $record->selectedId('offer_id');

        return $existing->tour_id === null && $offerId !== null && Tour::withTrashed()->where('legacy_id', $offerId)->exists();
    }

    protected function write(LegacyAdminExportRecord $record, ?Model $existing, LegacyAdminExport $export): ?Model
    {
        $offerId = $record->selectedId('offer_id');
        $tour = $offerId !== null ? Tour::withTrashed()->where('legacy_id', $offerId)->first() : null;
        $passengers = LegacyPassengerList::parse((string) $record->field('passengers'));
        $booking = $existing ?? $this->newLegacyBooking(TourInquiry::BOOKING_TYPE, $record);

        $booking->fill([
            ...$this->contact($record),
            'tour_id' => $tour?->id ?? $booking->tour_id,
            'offer_name_snapshot' => $tour?->name ?? $record->listValue('Ajánlat'),
            'phone' => $record->field('mobile') ?? $record->field('phone'),
            'passenger_count' => (int) $record->field('nr_adults') ?: (count($passengers) ?: null),
            'arrival' => LegacyAdminExportRecord::dateTime($record->field('inquiry_arrival_date'))?->toDateString(),
            'departure' => LegacyAdminExportRecord::dateTime($record->field('inquery_departure_date'))?->toDateString(),
        ]);
        $booking->payload = [
            ...($booking->payload ?? []),
            'postalCode' => $record->field('zip'),
            'passengers' => $passengers,
            'legacy' => $this->legacyPayload($record, [
                'offerId' => $offerId,
                'offerName' => $record->listValue('Ajánlat'),
                'offerDateId' => $record->selectedId('offer_date_id'),
                'offerDate' => $record->listValue('Időpont'),
                'customDate' => $record->field('custome_offer_date'),
                'departureId' => $record->selectedId('felszallas'),
            ]),
        ];

        if ($tour === null && ! $booking->exists) {
            $booking->admin_note = $this->adminNote($record, 'A régi ajánlat ('.($record->listValue('Ajánlat') ?? '-').') nem található az új rendszerben.');
        }

        $booking->save();

        return $booking;
    }
}
