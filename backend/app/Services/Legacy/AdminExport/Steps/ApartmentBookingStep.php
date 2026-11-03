<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\Apartment;
use App\Models\Booking;
use App\Models\LegacyImportRecord;
use App\Services\Booking\ApartmentBookingService;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use App\Support\Legacy\LegacyPassengerList;
use Illuminate\Database\Eloquent\Model;

/**
 * Legacy apartment bookings → apartment bookings, on the apartment of their
 * legacy id. They are marked contacted (the legacy office handled them) and
 * send no e-mails; what the new system adds later (status, admin note,
 * payments) is kept on a re-run.
 *
 * @extends RecordStep<Booking>
 */
final class ApartmentBookingStep extends RecordStep
{
    use BuildsLegacyBookings;

    public function key(): string
    {
        return 'apartment-bookings';
    }

    protected function entity(): string
    {
        return LegacyImportRecord::APARTMENT_BOOKING;
    }

    protected function modelClass(): string
    {
        return Booking::class;
    }

    protected function sources(): array
    {
        return ['management.apartment_reservation'];
    }

    /**
     * A booking imported before its apartment links to it once the apartment is there.
     */
    protected function needsRefresh(Model $existing, LegacyAdminExportRecord $record): bool
    {
        $apartmentId = $record->selectedId('apartment_id');

        return $existing->apartment_id === null && $apartmentId !== null && Apartment::withTrashed()->where('legacy_id', $apartmentId)->exists();
    }

    protected function write(LegacyAdminExportRecord $record, ?Model $existing, LegacyAdminExport $export): ?Model
    {
        $apartmentId = $record->selectedId('apartment_id');
        $apartment = $apartmentId !== null ? Apartment::withTrashed()->where('legacy_id', $apartmentId)->first() : null;
        $passengers = LegacyPassengerList::parse((string) $record->field('passengers'));
        $type = $record->field('type');
        $booking = $existing ?? $this->newLegacyBooking(ApartmentBookingService::BOOKING_TYPE, $record);

        $booking->fill([
            ...$this->contact($record),
            'apartment_id' => $apartment?->id ?? $booking->apartment_id,
            'region_id' => $apartment?->region_id ?? $booking->region_id,
            'location_id' => $apartment?->location_id ?? $booking->location_id,
            'apartment_name_snapshot' => $apartment?->name ?? $record->listValue('Apartman'),
            'offer_code' => $apartment?->code ?? $booking->offer_code,
            'phone' => $record->field('phone') ?? $record->field('mobile'),
            'passenger_count' => (int) $record->field('nr_applicant') ?: (count($passengers) ?: null),
            'arrival' => LegacyAdminExportRecord::dateTime($record->field('arrival'))?->toDateString(),
            'departure' => LegacyAdminExportRecord::dateTime($record->field('departure'))?->toDateString(),
            'check_in' => LegacyAdminExportRecord::dateTime($record->field('arrival'))?->toDateString(),
            'check_out' => LegacyAdminExportRecord::dateTime($record->field('departure'))?->toDateString(),
            'total_amount' => LegacyAdminExportRecord::amount($record->field('reservation_price')),
            'currency' => 'EUR',
        ]);
        $booking->payload = [
            ...($booking->payload ?? []),
            'postalCode' => $record->field('zip'),
            'apartmentType' => $type,
            'passengers' => array_map(fn (array $passenger): array => array_filter([
                'name' => $passenger['name'] ?? null,
                'birthDate' => $passenger['birth_date'] ?? null,
                'address' => $passenger['address'] ?? null,
                'documentNumber' => $passenger['document_number'] ?? null,
            ]), $passengers),
            'legacy' => $this->legacyPayload($record, ['apartmentId' => $apartmentId, 'apartment' => $record->listValue('Apartman'), 'referralCode' => $record->listValue('Ajánlói kód')]),
        ];

        if ($apartment === null && ! $booking->exists) {
            $booking->admin_note = $this->adminNote($record, 'A régi apartman ('.($record->listValue('Apartman') ?? '-').') nem található az új rendszerben.');
        }

        $booking->save();

        return $booking;
    }
}
