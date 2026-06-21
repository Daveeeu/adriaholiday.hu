<?php

namespace App\Http\Requests\Admin\Region;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Arr;
use Illuminate\Validation\Rule;

class StoreRegionRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'country_code' => $this->input('country_code', $this->input('countryCode')),
            'hero_image_url' => $this->input('hero_image_url', $this->input('heroImageUrl')),
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
            'slug' => ['required', 'string', 'max:255', Rule::unique('regions', 'slug')],
            'name' => ['required', 'string', 'max:255'],
            'country_code' => ['required', 'string', 'size:2'],
            'timezone' => ['required', 'string', 'max:100'],
            'currency' => ['required', 'string', 'size:3'],
            'hero_image_url' => ['nullable', 'string', 'max:2048'],
            'summary' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ];
    }
}
