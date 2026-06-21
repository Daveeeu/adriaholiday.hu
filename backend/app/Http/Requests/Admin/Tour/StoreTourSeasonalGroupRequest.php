<?php

namespace App\Http\Requests\Admin\Tour;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTourSeasonalGroupRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'active' => $this->boolean('active', true),
            'has_offers' => $this->boolean('has_offers', $this->boolean('hasOffers', false)),
            'menu_type' => $this->input('menu_type', $this->input('menuType')),
            'seo_name' => $this->input('seo_name', $this->input('seoName')),
            'seo_auto_generate' => $this->boolean('seo_auto_generate', $this->boolean('seoAutoGenerate', false)),
            'box_text' => $this->input('box_text', $this->input('boxText')),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'active' => ['boolean'],
            'menu_type' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'seo_name' => ['nullable', 'string', 'max:255', Rule::unique('tour_seasonal_groups', 'seo_name')],
            'seo_auto_generate' => ['boolean'],
            'box_text' => ['nullable', 'string'],
            'has_offers' => ['boolean'],
        ];
    }
}
