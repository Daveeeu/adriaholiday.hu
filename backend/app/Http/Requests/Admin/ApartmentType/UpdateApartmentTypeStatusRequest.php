<?php

namespace App\Http\Requests\Admin\ApartmentType;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApartmentTypeStatusRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'is_active' => $this->boolean('is_active', $this->boolean('isActive')),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'is_active' => ['required', 'boolean'],
        ];
    }
}
