<?php

namespace App\Services\Booking;

use App\Models\Tour;

/**
 * Validates a public booking submission's dynamic fields against the
 * booking form template assigned to the tour (or a sane default field
 * set when no template is assigned), and strips any values that don't
 * belong to a visible (required or optional) field.
 */
class BookingFormValidationService
{
    /**
     * @var array<int, array{key: string, label: string, inputGroup: string, visibility: string}>
     */
    private const DEFAULT_FIELDS = [
        ['key' => 'contact_name', 'label' => 'Teljes név', 'inputGroup' => 'contact', 'visibility' => 'required'],
        ['key' => 'contact_email', 'label' => 'E-mail', 'inputGroup' => 'contact', 'visibility' => 'required'],
        ['key' => 'contact_phone', 'label' => 'Telefonszám', 'inputGroup' => 'contact', 'visibility' => 'required'],
        ['key' => 'contact_city', 'label' => 'Város', 'inputGroup' => 'contact', 'visibility' => 'optional'],
        ['key' => 'passenger_name', 'label' => 'Utas neve', 'inputGroup' => 'passenger', 'visibility' => 'required'],
        ['key' => 'passenger_birth_date', 'label' => 'Születési dátum', 'inputGroup' => 'passenger', 'visibility' => 'required'],
        ['key' => 'passenger_nationality', 'label' => 'Állampolgárság', 'inputGroup' => 'passenger', 'visibility' => 'optional'],
    ];

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

            if ($fieldDef['visibility'] === 'required' && $value === '') {
                $errors["formData.{$fieldDef['key']}"] = "A(z) \"{$fieldDef['label']}\" mező megadása kötelező.";
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

                if ($fieldDef['visibility'] === 'required' && $value === '') {
                    $errors["passengers.{$index}.{$fieldDef['key']}"] = "A(z) \"{$fieldDef['label']}\" mező megadása kötelező az utasnál.";
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
     * @return array<int, array{key: string, label: string, inputGroup: string, visibility: string}>
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
                'inputGroup' => $templateField->field->input_group,
                'visibility' => $templateField->visibility,
            ])
            ->all();
    }

    private function sanitizeValue(mixed $value): string
    {
        return trim(strip_tags((string) $value));
    }
}
