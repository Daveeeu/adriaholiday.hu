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
            'field_type' => ['required', 'string', Rule::in(BookingFormField::FIELD_TYPES)],
            'input_group' => ['required', 'string', Rule::in(BookingFormField::INPUT_GROUPS)],
            'options' => ['nullable', 'array', 'max:50', 'required_if:field_type,select'],
            'options.*' => ['string', 'max:255', 'distinct'],
        ];
    }

    public function messages(): array
    {
        return [
            'options.required_if' => 'Legördülő mezőhöz legalább egy választási lehetőséget meg kell adni.',
            'options.*.distinct' => 'A választási lehetőségek nem ismétlődhetnek.',
        ];
    }
}
