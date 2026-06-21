<?php

namespace App\Http\Requests\Admin\Gallery;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateGalleryRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'region_id' => $this->input('region_id', $this->input('regionId')),
            'is_active' => $this->boolean('is_active', $this->boolean('isActive', true)),
            'sort_order' => $this->input('sort_order', $this->input('sortOrder', 0)),
        ]);
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'region_id' => ['required', 'integer', 'exists:regions,id'],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', Rule::in(['offer', 'apartment', 'destination'])],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}
