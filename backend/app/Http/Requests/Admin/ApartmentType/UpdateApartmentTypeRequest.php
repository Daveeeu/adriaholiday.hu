<?php

namespace App\Http\Requests\Admin\ApartmentType;

use App\Models\ApartmentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateApartmentTypeRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active', $this->boolean('isActive', true)),
            'sort_order' => $this->input('sort_order', $this->input('sortOrder', 0)),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $apartmentTypeId = $this->route('apartmentType')?->id ?? $this->route('apartmentType');

        return [
            'slug' => [
                'required',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('apartment_types', 'slug')->ignore($apartmentTypeId),
                Rule::notIn(ApartmentType::RESERVED_SLUGS),
            ],
            'name' => ['required', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}
