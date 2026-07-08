<?php

namespace App\Http\Requests\Admin\BookingFormTemplate;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class StoreBookingFormTemplateRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $name = trim((string) $this->input('name', ''));
        $slug = trim((string) $this->input('slug', ''));

        $this->merge([
            'name' => $name,
            'slug' => $slug !== '' ? $slug : Str::slug($name),
            'description' => $this->input('description'),
            'active' => $this->boolean('active', true),
            'fields' => collect($this->input('fields', []))->map(function (array $field, int $index): array {
                return [
                    'field_id' => $field['field_id'] ?? $field['fieldId'] ?? null,
                    'visibility' => $field['visibility'] ?? 'optional',
                    'sort_order' => $field['sort_order'] ?? $field['sortOrder'] ?? ($index + 1),
                ];
            })->all(),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('booking_form_templates', 'slug')],
            'description' => ['nullable', 'string'],
            'active' => ['boolean'],
            'fields' => ['nullable', 'array'],
            'fields.*.field_id' => ['required', 'integer', 'exists:booking_form_fields,id'],
            'fields.*.visibility' => ['required', 'string', Rule::in(['required', 'optional', 'hidden'])],
            'fields.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
