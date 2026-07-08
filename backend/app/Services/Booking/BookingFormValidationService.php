<?php

namespace App\Services\Booking;

use App\Models\Tour;

/**
 * Validates a public booking submission's dynamic fields against the
 * booking form template assigned to the tour, and strips any values
 * that don't belong to a visible (required or optional) field.
 */
class BookingFormValidationService
{
    /**
     * @param  array<string, mixed>  $formData
     * @param  array<int, array<string, mixed>>  $passengers
     * @return array{errors: array<string, string>, formData: array<string, mixed>, passengers: array<int, array<string, mixed>>}
     */
    public function validate(Tour $tour, array $formData, array $passengers): array
    {
        $template = $tour->bookingFormTemplate;

        if (! $template) {
            return ['errors' => [], 'formData' => $formData, 'passengers' => $passengers];
        }

        $errors = [];
        $filteredFormData = [];
        $passengerFields = [];

        foreach ($template->templateFields as $templateField) {
            $field = $templateField->field;

            if (! $field || $templateField->visibility === 'hidden') {
                continue;
            }

            if ($field->input_group !== 'contact') {
                $passengerFields[] = $templateField;

                continue;
            }

            $value = trim((string) ($formData[$field->key] ?? ''));

            if ($templateField->visibility === 'required' && $value === '') {
                $errors["formData.{$field->key}"] = "A(z) \"{$field->label}\" mező megadása kötelező.";
            }

            if ($value !== '') {
                $filteredFormData[$field->key] = $value;
            }
        }

        $hasRequiredPassengerField = collect($passengerFields)->contains(fn ($templateField) => $templateField->visibility === 'required');

        if ($hasRequiredPassengerField && $passengers === []) {
            $errors['passengers'] = 'Legalább egy utas adatainak megadása kötelező.';
        }

        $filteredPassengers = [];

        foreach ($passengers as $index => $passenger) {
            $filteredPassenger = [];

            foreach ($passengerFields as $templateField) {
                $field = $templateField->field;
                $value = trim((string) ($passenger[$field->key] ?? ''));

                if ($templateField->visibility === 'required' && $value === '') {
                    $errors["passengers.{$index}.{$field->key}"] = "A(z) \"{$field->label}\" mező megadása kötelező az utasnál.";
                }

                if ($value !== '') {
                    $filteredPassenger[$field->key] = $value;
                }
            }

            $filteredPassengers[] = $filteredPassenger;
        }

        return ['errors' => $errors, 'formData' => $filteredFormData, 'passengers' => $filteredPassengers];
    }
}
