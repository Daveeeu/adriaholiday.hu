<?php

namespace App\Services\Legacy;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourDate;
use App\Support\Booking\TourBookingStatus;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Copies tour bookings exported from the legacy adriaholiday.hu admin (one record
 * per booking, as read from its "Módosít" form) into the new booking system.
 *
 * Imported bookings keep their legacy position number (or "legacy-{id}" when they
 * have none) as offer_code, so a booking is imported once however often the import runs. They hold no seats (the
 * imported tour dates' free seats already account for them) and send no e-mails.
 */
class LegacyBookingImporter
{
    private const INSURANCE_LABELS = [
        'insurance' => 'ALFA utasbiztosítás',
        'cancellation' => 'ALFA útlemondási biztosítás',
        'cancellationZ1' => 'ALFA útlemondási biztosítás (Z1 covid kiegészítéssel)',
        'insuranceEub' => 'ALFA Compass utasbiztosítás',
        'cancellationEub' => 'ALFA Compass útlemondási biztosítás',
    ];

    /**
     * @var Collection<string, Tour>|null tours keyed by normalized name
     */
    private ?Collection $tours = null;

    /**
     * @param  array<string, mixed>  $record
     */
    public function import(array $record, bool $dryRun): LegacyBookingImportResult
    {
        $position = trim((string) ($record['position'] ?? ''));
        $legacyId = (int) ($record['id'] ?? 0);

        if ($legacyId <= 0) {
            return LegacyBookingImportResult::invalid('Hiányzó azonosító.');
        }

        // Some legacy bookings have no position number; their legacy id identifies them instead.
        $code = $position !== '' ? $position : "legacy-{$legacyId}";

        if (Booking::query()->where('booking_type', 'tour_booking')->where('offer_code', $code)->exists()) {
            return LegacyBookingImportResult::alreadyImported();
        }

        $offerName = trim((string) ($record['offerName'] ?? ''));
        [$start] = $this->dateRange((string) ($record['offerDate'] ?? ''), (string) ($record['customDate'] ?? ''));
        $tour = $this->tourNamed($offerName);
        $tourDate = $tour !== null && $start !== null
            ? TourDate::query()->where('tour_id', $tour->id)->whereDate('start_date', $start->toDateString())->first()
            : null;
        $passengers = $this->passengers((string) ($record['passengers'] ?? ''));

        if (! $dryRun) {
            $createdAt = $this->dateTime((string) ($record['createdAt'] ?? '')) ?? now();

            $booking = new Booking([
                'booking_type' => 'tour_booking',
                'status' => (string) ($record['canceled'] ?? '0') === '1' ? TourBookingStatus::CANCELLED : TourBookingStatus::CONFIRMED,
                'cancelled' => (string) ($record['canceled'] ?? '0') === '1',
                'seats_reserved' => false,
                'tour_id' => $tour?->id,
                'tour_date_id' => $tourDate?->id,
                'offer_name_snapshot' => $tour?->name ?? $offerName,
                'offer_code' => $code,
                'customer_name' => $this->nullable($record['name'] ?? null),
                'email' => $this->nullable($record['email'] ?? null),
                'phone' => $this->nullable($record['mobile'] ?? null),
                'city' => $this->nullable($record['city'] ?? null),
                'address' => $this->nullable(trim(($record['zip'] ?? '').' '.($record['city'] ?? '').', '.($record['street'] ?? ''), ' ,')),
                'passenger_count' => (int) ($record['adults'] ?? 0) ?: (count($passengers) ?: null),
                'departure_date' => $start?->toDateString(),
                'booking_date' => $createdAt,
                'message' => $this->nullable($record['message'] ?? null),
                'admin_note' => $this->adminNote($record, $legacyId, $tour === null),
                'total_amount' => is_numeric($record['price'] ?? null) ? (float) $record['price'] : null,
                'currency' => 'HUF',
                'payload' => [
                    'formData' => array_filter([
                        'contact_name' => $this->nullable($record['name'] ?? null),
                        'contact_email' => $this->nullable($record['email'] ?? null),
                        'contact_phone' => $this->nullable($record['mobile'] ?? null),
                        'contact_postal_code' => $this->nullable($record['zip'] ?? null),
                        'contact_city' => $this->nullable($record['city'] ?? null),
                        'contact_address' => $this->nullable($record['street'] ?? null),
                        'extra_single_room' => $this->singleRoom($record),
                    ], fn (?string $value): bool => $value !== null),
                    'passengers' => $passengers,
                    'legacy' => [
                        'id' => $legacyId,
                        'offerId' => $record['offerId'] ?? null,
                        'offerName' => $offerName,
                        'offerDateId' => $record['offerDateId'] ?? null,
                        'offerDate' => $record['offerDate'] ?? null,
                        'departure' => $record['departure'] ?? null,
                        'insurances' => $this->orderedInsurances($record),
                    ],
                ],
            ]);
            $booking->created_at = $createdAt;
            $booking->save();
        }

        return LegacyBookingImportResult::imported($tour !== null, $tourDate !== null, $offerName);
    }

    /**
     * Legacy passenger list: "Name [útiokmány: X, lakcím: Y, születési dátum: Z], …".
     *
     * @return array<int, array<string, string>>
     */
    private function passengers(string $text): array
    {
        preg_match_all('/([^\[\],][^\[\]]*?)\s*\[([^\]]*)\]/u', $text, $matches, PREG_SET_ORDER);

        return array_values(array_filter(array_map(function (array $match): array {
            $details = $match[2];

            return array_filter([
                'passenger_name' => trim($match[1], " ,\t\n"),
                'document_number' => $this->labelled($details, 'útiokmány'),
                'passenger_address' => $this->labelled($details, 'lakcím'),
                'passenger_birth_date' => $this->labelled($details, 'születési dátum'),
            ], fn (?string $value): bool => $value !== null && $value !== '');
        }, $matches)));
    }

    private function labelled(string $details, string $label): ?string
    {
        $pattern = '/'.preg_quote($label, '/').':\s*(.*?)\s*(?:,\s*(?:útiokmány|lakcím|születési dátum):|$)/u';

        return preg_match($pattern, $details, $match) ? $this->nullable(trim($match[1], ' ,')) : null;
    }

    /**
     * @return array{0: ?CarbonImmutable, 1: ?CarbonImmutable} start and end date
     */
    private function dateRange(string $offerDate, string $customDate): array
    {
        preg_match_all('/\d{4}-\d{2}-\d{2}/', $offerDate !== '' ? $offerDate : $customDate, $matches);
        $dates = array_map(fn (string $date): CarbonImmutable => CarbonImmutable::parse($date), $matches[0]);

        return [$dates[0] ?? null, $dates[1] ?? null];
    }

    private function dateTime(string $value): ?CarbonImmutable
    {
        return preg_match('/^\d{4}-\d{2}-\d{2}/', $value) ? CarbonImmutable::parse($value) : null;
    }

    private function tourNamed(string $name): ?Tour
    {
        $this->tours ??= Tour::query()->get(['id', 'name'])->keyBy(fn (Tour $tour): string => $this->normalize($tour->name));

        return $this->tours->get($this->normalize($name));
    }

    /**
     * Legacy offer names carry a subtitle in parentheses ("Toszkán impressziók ( Firenze … )")
     * and differ from the tour names in case, accents and punctuation.
     */
    private function normalize(string $name): string
    {
        $withoutSubtitle = (string) preg_replace('/\s*\(.*?\)\s*/u', ' ', $name);

        return trim((string) preg_replace('/[^a-z0-9]+/', ' ', Str::lower(Str::ascii($withoutSubtitle))));
    }

    private function singleRoom(array $record): ?string
    {
        return match (true) {
            ($record['singleAlone'] ?? null) === '1' => 'Igen – egyedül a szobában',
            ($record['singleRoommate'] ?? null) === '1' => 'Igen – szobatársat kér',
            default => null,
        };
    }

    /**
     * @return array<int, string>
     */
    private function orderedInsurances(array $record): array
    {
        return array_values(array_map(
            fn (string $key): string => self::INSURANCE_LABELS[$key],
            array_filter(array_keys(self::INSURANCE_LABELS), fn (string $key): bool => ($record[$key] ?? null) === 'yes'),
        ));
    }

    private function adminNote(array $record, int $legacyId, bool $tourMissing): string
    {
        $insurances = $this->orderedInsurances($record);
        $lines = array_filter([
            "Áthozva a régi rendszerből (#{$legacyId}).",
            $tourMissing ? 'A régi ajánlat ('.($record['offerName'] ?? '-').') nem található az új rendszerben.' : null,
            ($record['offerDate'] ?? '') !== '' ? 'Időpont: '.$record['offerDate'] : null,
            ($record['departure'] ?? '') !== '' ? 'Felszállás: '.$record['departure'] : null,
            'Biztosítás: '.($insurances !== [] ? implode(', ', $insurances) : 'nem kért'),
            $this->nullable($record['description'] ?? null) !== null ? 'Régi leírás: '.trim((string) $record['description']) : null,
        ]);

        return implode("\n", $lines);
    }

    private function nullable(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }
}
