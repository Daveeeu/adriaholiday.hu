<?php

namespace App\Services\Booking;

use App\Models\BookingFormTemplate;
use App\Models\BookingFormTemplateField;
use App\Models\Tour;
use App\Support\Booking\DefaultBookingForm;

/**
 * Decides which fields the public booking form of a tour shows: the tour's
 * own template, otherwise the active default template, otherwise the
 * built-in default form. Both the public offer page and the booking
 * validation use this, so the form shown and the form validated never drift.
 */
class BookingFormFieldResolver
{
    /**
     * Visible (required or optional) fields in display order.
     *
     * @return array<int, array{key: string, label: string, fieldType: string, inputGroup: string, options: array<int, string>|null, description: string|null, priceLabel: string|null, visibility: string}>
     */
    public function resolve(Tour $tour): array
    {
        $template = $tour->bookingFormTemplate ?? $this->defaultTemplate();

        if (! $template) {
            return DefaultBookingForm::FIELDS;
        }

        return $template->templateFields
            ->filter(fn (BookingFormTemplateField $templateField): bool => $templateField->field !== null
                && $templateField->visibility !== 'hidden')
            ->sortBy('sort_order')
            ->map(fn (BookingFormTemplateField $templateField): array => [
                'key' => $templateField->field->key,
                'label' => $templateField->field->label,
                'fieldType' => $templateField->field->field_type,
                'inputGroup' => $templateField->field->input_group,
                'options' => $templateField->field->options,
                'description' => $templateField->field->description,
                'priceLabel' => $templateField->field->price_label,
                'visibility' => $templateField->visibility,
            ])
            ->values()
            ->all();
    }

    private function defaultTemplate(): ?BookingFormTemplate
    {
        return BookingFormTemplate::query()
            ->where('is_default', true)
            ->where('active', true)
            ->with('templateFields.field')
            ->first();
    }
}
