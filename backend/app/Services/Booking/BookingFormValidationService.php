<?php

namespace App\Services\Booking;

use App\Models\BookingFormField;
use App\Models\Tour;
use App\Support\Booking\DefaultBookingForm;
use DateTimeImmutable;

/**
 * Validates a public booking submission's dynamic fields against the form
 * resolved for the tour (see BookingFormFieldResolver), checks each value
 * against its field type, and strips any values that don't belong to a
 * visible (required or optional) field.
 */
class BookingFormValidationService
{
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
     * @param  array{label: string, fieldType: string, options: array<int, string>|null, visibility: string}  $fieldDef
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

        $isValid = match ($fieldDef['fieldType']) {
            'email' => filter_var($value, FILTER_VALIDATE_EMAIL) !== false,
            'date' => $this->isValidDate($value),
            'number' => is_numeric($value),
            'select', 'radio' => in_array($value, $fieldDef['options'] ?? [], true),
            'checkbox' => $value === BookingFormField::CHECKBOX_CHECKED_VALUE,
            default => true,
        };

        return $isValid ? null : "A(z) \"{$label}\" mező értéke érvénytelen.";
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
