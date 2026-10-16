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
 * have none) as offer_code, so a booking is imported once however often the import
 * runs; a re-run refreshes it from the legacy admin. They hold no seats (the
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

    /** The largest amount bookings.total_amount holds. */
    private const MAX_AMOUNT = 99_999_999.99;

    /**
     * @var Collection<string, Tour>|null tours keyed by normalized name
     */
    private ?Collection $tours = null;

    /**
     * Imports a legacy booking, or refreshes the one imported before from it:
     * its tour and date (by their legacy ids, else by name and start date),
     * contact, passengers, price and cancellation. What the new system adds
     * (payments, e-mails, the admin note, a later booking status) stays.
     *
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
        $existing = Booking::withTrashed()->where('booking_type', 'tour_booking')->where('offer_code', $code)->first();

        if ($existing !== null && (int) ($existing->payload['legacy']['id'] ?? 0) !== $legacyId) {
            return LegacyBookingImportResult::invalid("A(z) {$code} pozíciószámú foglalás nem a régi rendszerből jött; nem írja felül.");
        }

        $offerName = trim((string) ($record['offerName'] ?? ''));
        [$start] = $this->dateRange((string) ($record['offerDate'] ?? ''), (string) ($record['customDate'] ?? ''));
        $tour = $this->legacyTour($record) ?? $this->tourNamed($offerName);
        $tourDate = $tour !== null ? $this->legacyDate($record, $tour, $start) : null;
        $passengers = $this->passengers((string) ($record['passengers'] ?? ''));
        $cancelled = (string) ($record['canceled'] ?? '0') === '1';
        $attributes = [
            'cancelled' => $cancelled,
            'tour_id' => $tour?->id ?? $existing?->tour_id,
            'tour_date_id' => $tourDate?->id ?? $existing?->tour_date_id,
            'offer_name_snapshot' => $tour?->name ?? $offerName,
            'customer_name' => $this->nullable($record['name'] ?? null),
            'email' => $this->nullable($record['email'] ?? null),
            'phone' => $this->nullable($record['mobile'] ?? null),
            'city' => $this->nullable($record['city'] ?? null),
            'address' => $this->nullable(trim(($record['zip'] ?? '').' '.($record['city'] ?? '').', '.($record['street'] ?? ''), ' ,')),
            'passenger_count' => (int) ($record['adults'] ?? 0) ?: (count($passengers) ?: null),
            'departure_date' => $start?->toDateString(),
            'message' => $this->nullable($record['message'] ?? null),
            'total_amount' => $this->amount($record),
        ];
        $payload = [
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
                'departureId' => $record['departureId'] ?? null,
                'departure' => $record['departure'] ?? null,
                'price' => $record['price'] ?? null,
                'insurances' => $this->orderedInsurances($record),
            ],
        ];

        if ($existing !== null) {
            return $this->refresh($existing, $attributes, $payload, $cancelled, $dryRun, $tour !== null, $tourDate !== null, $offerName);
        }

        if (! $dryRun) {
            $createdAt = $this->dateTime((string) ($record['createdAt'] ?? '')) ?? now();

            $booking = new Booking([
                ...$attributes,
                'booking_type' => 'tour_booking',
                'status' => $cancelled ? TourBookingStatus::CANCELLED : TourBookingStatus::CONFIRMED,
                'seats_reserved' => false,
                'offer_code' => $code,
                'booking_date' => $createdAt,
                'admin_note' => $this->adminNote($record, $legacyId, $tour === null),
                'currency' => 'HUF',
                'payload' => $payload,
            ]);
            $booking->created_at = $createdAt;
            $booking->save();
        }

        return LegacyBookingImportResult::imported($tour !== null, $tourDate !== null, $offerName);
    }

    /**
     * @param  array<string, mixed>  $attributes
     * @param  array<string, mixed>  $payload
     */
    private function refresh(Booking $booking, array $attributes, array $payload, bool $cancelled, bool $dryRun, bool $tourMatched, bool $dateMatched, string $offerName): LegacyBookingImportResult
    {
        $booking->fill($attributes);
        $booking->payload = [...($booking->payload ?? []), ...$payload];

        // A booking cancelled in the legacy admin is cancelled here; one the
        // new system moved on (e.g. paid) keeps its status otherwise.
        if ($cancelled) {
            $booking->status = TourBookingStatus::CANCELLED;
        } elseif ($booking->status === TourBookingStatus::CANCELLED) {
            $booking->status = TourBookingStatus::CONFIRMED;
        }

        if (! $booking->isDirty()) {
            return LegacyBookingImportResult::alreadyImported();
        }

        if (! $dryRun) {
            $booking->save();
        }

        return LegacyBookingImportResult::updated($tourMatched, $dateMatched, $offerName);
    }

    /**
     * The booking's price, unless the legacy value is no real price (one
     * legacy test booking says 133 931 600 Ft for 998 people); the legacy
     * value stays in the payload either way.
     *
     * @param  array<string, mixed>  $record
     */
    private function amount(array $record): ?float
    {
        $price = $record['price'] ?? null;

        return is_numeric($price) && (float) $price >= 0 && (float) $price <= self::MAX_AMOUNT ? (float) $price : null;
    }

    /**
     * @param  array<string, mixed>  $record
     */
    private function legacyTour(array $record): ?Tour
    {
        $offerId = (int) ($record['offerId'] ?? 0);

        return $offerId > 0 ? Tour::withTrashed()->where('legacy_id', $offerId)->first() : null;
    }

    /**
     * @param  array<string, mixed>  $record
     */
    private function legacyDate(array $record, Tour $tour, ?CarbonImmutable $start): ?TourDate
    {
        $dateId = (int) ($record['offerDateId'] ?? 0);
        $byLegacyId = $dateId > 0 ? TourDate::withTrashed()->where('tour_id', $tour->id)->where('legacy_id', $dateId)->first() : null;

        return $byLegacyId ?? ($start !== null ? TourDate::query()->where('tour_id', $tour->id)->whereDate('start_date', $start->toDateString())->first() : null);
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
            $this->amount($record) === null && ($record['price'] ?? '') !== '' ? 'A régi ár ('.$record['price'].') nem valós összeg; ár nélkül áthozva.' : null,
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
