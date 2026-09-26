<?php

namespace App\Http\Requests\Admin\BookingFormField;

use App\Models\BookingFormField;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingFormFieldRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $options = $this->input('options');

        $this->merge([
            'label' => trim((string) $this->input('label', '')),
            'description' => $this->nullableTrimmed($this->input('description')),
            'price_label' => $this->nullableTrimmed($this->input('price_label', $this->input('priceLabel'))),
            'field_type' => $this->input('field_type', $this->input('fieldType')),
            'input_group' => $this->input('input_group', $this->input('inputGroup')),
            'options' => is_array($options)
                ? collect($options)
                    ->map(fn ($option) => is_string($option) ? trim($option) : $option)
                    ->filter(fn ($option) => $option !== '' && $option !== null)
                    ->values()
                    ->all()
                : $options,
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'price_label' => ['nullable', 'string', 'max:100'],
            'field_type' => ['required', 'string', Rule::in(BookingFormField::FIELD_TYPES)],
            'input_group' => ['required', 'string', Rule::in(BookingFormField::INPUT_GROUPS)],
            'options' => [
                'nullable',
                'array',
                'max:50',
                Rule::requiredIf(fn (): bool => BookingFormField::usesOptions((string) $this->input('field_type'))),
            ],
            'options.*' => ['string', 'max:255', 'distinct'],
        ];
    }

    public function messages(): array
    {
        return [
            'options.required' => 'Legördülő listához és választógombokhoz legalább egy lehetőséget meg kell adni.',
            'options.*.distinct' => 'A választási lehetőségek nem ismétlődhetnek.',
        ];
    }

    private function nullableTrimmed(mixed $value): ?string
    {
        $trimmed = trim((string) $value);

        return $trimmed === '' ? null : $trimmed;
    }
}
