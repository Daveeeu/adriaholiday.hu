<?php

namespace App\Services\Booking;

use App\Models\BookingFormField;
use App\Models\Tour;
use DateTimeImmutable;

/**
 * Validates a public booking submission's dynamic fields against the
 * booking form template assigned to the tour (or a sane default field
 * set when no template is assigned), checks each value against its field
 * type, and strips any values that don't belong to a visible (required or
 * optional) field.
 */
class BookingFormValidationService
{
    /**
     * @var array<int, array{key: string, label: string, fieldType: string, inputGroup: string, options: array<int, string>|null, visibility: string}>
     */
    private const DEFAULT_FIELDS = [
        ['key' => 'contact_name', 'label' => 'Teljes név', 'fieldType' => 'text', 'inputGroup' => 'contact', 'options' => null, 'visibility' => 'required'],
        ['key' => 'contact_email', 'label' => 'E-mail', 'fieldType' => 'email', 'inputGroup' => 'contact', 'options' => null, 'visibility' => 'required'],
        ['key' => 'contact_phone', 'label' => 'Telefonszám', 'fieldType' => 'tel', 'inputGroup' => 'contact', 'options' => null, 'visibility' => 'required'],
        ['key' => 'contact_city', 'label' => 'Város', 'fieldType' => 'text', 'inputGroup' => 'contact', 'options' => null, 'visibility' => 'optional'],
        ['key' => 'passenger_name', 'label' => 'Utas neve', 'fieldType' => 'text', 'inputGroup' => 'passenger', 'options' => null, 'visibility' => 'required'],
        ['key' => 'passenger_birth_date', 'label' => 'Születési dátum', 'fieldType' => 'date', 'inputGroup' => 'passenger', 'options' => null, 'visibility' => 'required'],
        ['key' => 'passenger_nationality', 'label' => 'Állampolgárság', 'fieldType' => 'text', 'inputGroup' => 'passenger', 'options' => null, 'visibility' => 'optional'],
    ];

    /**
     * Labels for every known field key, so stored bookings stay readable even
     * after a field is removed from the tour's template.
     *
     * @return array<string, string>
     */
    public static function fieldLabels(): array
    {
        return array_merge(
            collect(self::DEFAULT_FIELDS)->pluck('label', 'key')->all(),
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
        $fields = $this->resolveFields($tour);

        $errors = [];
        $filteredFormData = [];
        $passengerFieldDefs = [];

        foreach ($fields as $fieldDef) {
            if ($fieldDef['visibility'] === 'hidden') {
                continue;
            }

            if ($fieldDef['inputGroup'] !== 'contact') {
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
     * @return array<int, array{key: string, label: string, fieldType: string, inputGroup: string, options: array<int, string>|null, visibility: string}>
     */
    private function resolveFields(Tour $tour): array
    {
        $template = $tour->bookingFormTemplate;

        if (! $template) {
            return self::DEFAULT_FIELDS;
        }

        return $template->templateFields
            ->filter(fn ($templateField): bool => $templateField->field !== null)
            ->map(fn ($templateField): array => [
                'key' => $templateField->field->key,
                'label' => $templateField->field->label,
                'fieldType' => $templateField->field->field_type,
                'inputGroup' => $templateField->field->input_group,
                'options' => $templateField->field->options,
                'visibility' => $templateField->visibility,
            ])
            ->all();
    }

    /**
     * @param  array{label: string, fieldType: string, options: array<int, string>|null, visibility: string}  $fieldDef
     */
    private function validateValue(array $fieldDef, string $value): ?string
    {
        $label = $fieldDef['label'];

        if ($value === '') {
            return $fieldDef['visibility'] === 'required' ? "A(z) \"{$label}\" mező megadása kötelező." : null;
        }

        $isValid = match ($fieldDef['fieldType']) {
            'email' => filter_var($value, FILTER_VALIDATE_EMAIL) !== false,
            'date' => $this->isValidDate($value),
            'number' => is_numeric($value),
            'select' => in_array($value, $fieldDef['options'] ?? [], true),
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
