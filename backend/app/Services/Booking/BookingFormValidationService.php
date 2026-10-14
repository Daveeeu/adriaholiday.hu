<?php

namespace App\Services\Booking;

use App\Models\BookingFormField;
use App\Models\Tour;
use App\Support\Booking\DefaultBookingForm;
use DateTimeImmutable;

/**
 * Validates a public booking submission's dynamic fields against the form
 * resolved for the tour (see BookingFormFieldResolver), checks each value
 * against its field type and the well-known fields' formats (full name,
 * postal code, birth date), and strips any values that don't belong to a
 * visible (required or optional) field. The booking form in the public site
 * (src/app/booking/booking-form-fields.ts) applies the same rules and messages.
 */
class BookingFormValidationService
{
    /** Phone numbers: digits with the usual separators, 8–15 digits in all. */
    private const PHONE_PATTERN = '/^\+?[\d\s()\/.-]+$/';

    private const PHONE_MIN_DIGITS = 8;

    private const PHONE_MAX_DIGITS = 15;

    /** Hungarian (1051) and foreign postal codes (945 01, SW1A 1AA) alike. */
    private const POSTAL_CODE_PATTERN = '/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/';

    /** The oldest birth date accepted, in years before today. */
    private const MAX_AGE_YEARS = 120;

    public function __construct(private readonly BookingFormFieldResolver $fieldResolver) {}

    /**
     * Labels for every known field key, so stored bookings stay readable even
     * after a field is removed from the tour's template.
     *
     * @return array<string, string>
     */
    public static function fieldLabels(): array
    {
        return array_merge(
            collect(DefaultBookingForm::FIELDS)->pluck('label', 'key')->all(),
            BookingFormField::query()->pluck('label', 'key')->all(),
        );
    }

    /**
     * @param  array<string, mixed>  $formData
     * @param  array<int, array<string, mixed>>  $passengers
     * @return array{errors: array<string, string>, formData: array<string, mixed>, passengers: array<int, array<string, mixed>>}
     */
    public function validate(Tour $tour, array $formData, array $passengers): array
    {
        $fields = $this->fieldResolver->resolve($tour);

        $errors = [];
        $filteredFormData = [];
        $passengerFieldDefs = [];

        foreach ($fields as $fieldDef) {
            if ($fieldDef['inputGroup'] === BookingFormField::PASSENGER_GROUP) {
                $passengerFieldDefs[] = $fieldDef;

                continue;
            }

            $value = $this->sanitizeValue($formData[$fieldDef['key']] ?? '');

            $error = $this->validateValue($fieldDef, $value);

            if ($error !== null) {
                $errors["formData.{$fieldDef['key']}"] = $error;
            }

            if ($value !== '') {
                $filteredFormData[$fieldDef['key']] = $value;
            }
        }

        $hasRequiredPassengerField = collect($passengerFieldDefs)
            ->contains(fn (array $fieldDef): bool => $fieldDef['visibility'] === 'required');

        if ($hasRequiredPassengerField && $passengers === []) {
            $errors['passengers'] = 'Legalább egy utas adatainak megadása kötelező.';
        }

        $filteredPassengers = [];

        foreach ($passengers as $index => $passenger) {
            $filteredPassenger = [];

            foreach ($passengerFieldDefs as $fieldDef) {
                $value = $this->sanitizeValue($passenger[$fieldDef['key']] ?? '');

                $error = $this->validateValue($fieldDef, $value);

                if ($error !== null) {
                    $errors["passengers.{$index}.{$fieldDef['key']}"] = $error;
                }

                if ($value !== '') {
                    $filteredPassenger[$fieldDef['key']] = $value;
                }
            }

            $filteredPassengers[] = $filteredPassenger;
        }

        return ['errors' => $errors, 'formData' => $filteredFormData, 'passengers' => $filteredPassengers];
    }

    /**
     * @param  array{key: string, label: string, fieldType: string, options: array<int, string>|null, disabledOptions?: array<int, string>, visibility: string}  $fieldDef
     */
    private function validateValue(array $fieldDef, string $value): ?string
    {
        $label = $fieldDef['label'];

        if ($value === '') {
            if ($fieldDef['visibility'] !== 'required') {
                return null;
            }

            return $fieldDef['fieldType'] === 'checkbox'
                ? "A(z) \"{$label}\" bejelölése kötelező."
                : "A(z) \"{$label}\" mező megadása kötelező.";
        }

        $typeError = match ($fieldDef['fieldType']) {
            'email' => filter_var($value, FILTER_VALIDATE_EMAIL) !== false ? null : 'Adj meg érvényes e-mail címet (pl. nev@example.hu).',
            'tel' => $this->isValidPhone($value) ? null : 'Adj meg érvényes telefonszámot (pl. +36 30 123 4567).',
            'date' => $this->dateError($fieldDef['key'], $value),
            'number' => is_numeric($value) ? null : "A(z) \"{$label}\" mezőbe számot adj meg.",
            'select', 'radio' => in_array($value, $fieldDef['options'] ?? [], true)
                && ! in_array($value, $fieldDef['disabledOptions'] ?? [], true) ? null : "A(z) \"{$label}\" mező értéke érvénytelen.",
            'checkbox' => $value === BookingFormField::CHECKBOX_CHECKED_VALUE ? null : "A(z) \"{$label}\" mező értéke érvénytelen.",
            default => null,
        };

        return $typeError ?? $this->formatError($fieldDef['key'], $value);
    }

    /**
     * Formats of the well-known text fields, recognised by key so a template's
     * own copy of them (e.g. "passenger_name") is checked the same way.
     */
    private function formatError(string $key, string $value): ?string
    {
        if (str_ends_with($key, '_name') && preg_match('/\p{L}\S*\s+\S/u', $value) !== 1) {
            return 'Add meg a teljes nevet (vezeték- és keresztnevet).';
        }

        if (str_ends_with($key, 'postal_code') && preg_match(self::POSTAL_CODE_PATTERN, $value) !== 1) {
            return 'Adj meg érvényes irányítószámot.';
        }

        return null;
    }

    private function isValidPhone(string $value): bool
    {
        $digits = strlen((string) preg_replace('/\D/', '', $value));

        return preg_match(self::PHONE_PATTERN, $value) === 1
            && $digits >= self::PHONE_MIN_DIGITS
            && $digits <= self::PHONE_MAX_DIGITS;
    }

    private function dateError(string $key, string $value): ?string
    {
        if (! $this->isValidDate($value)) {
            return 'Adj meg érvényes dátumot.';
        }

        if (! str_contains($key, 'birth')) {
            return null;
        }

        $today = now()->toDateString();

        if ($value > $today) {
            return 'A születési dátum nem lehet a jövőben.';
        }

        return $value < now()->subYears(self::MAX_AGE_YEARS)->toDateString()
            ? 'Ellenőrizd a születési dátumot.'
            : null;
    }

    private function isValidDate(string $value): bool
    {
        $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);

        return $date !== false && $date->format('Y-m-d') === $value;
    }

    private function sanitizeValue(mixed $value): string
    {
        return trim(strip_tags((string) $value));
    }
}
