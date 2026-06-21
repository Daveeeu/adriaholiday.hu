<?php

namespace App\Http\Requests\Admin\Tour;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTourRegionGroupRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'gallery_id' => $this->input('gallery_id', $this->input('galleryId')),
            'featured_on_homepage' => $this->boolean('featured_on_homepage', $this->boolean('featuredOnHomepage', false)),
            'active' => $this->boolean('active', true),
            'seo_name' => $this->input('seo_name', $this->input('seoName')),
            'seo_auto_generate' => $this->boolean('seo_auto_generate', $this->boolean('seoAutoGenerate', false)),
            'list_below_text' => $this->input('list_below_text', $this->input('listBelowText')),
            'travel_conditions_link' => $this->input('travel_conditions_link', $this->input('travelConditionsLink')),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('tourRegionGroup')?->id ?? $this->route('tourRegionGroup');

        return [
            'active' => ['boolean'],
            'featured_on_homepage' => ['boolean'],
            'type' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'seo_name' => ['nullable', 'string', 'max:255', Rule::unique('tour_region_groups', 'seo_name')->ignore($id)],
            'seo_auto_generate' => ['boolean'],
            'gallery_id' => ['nullable', 'integer', 'exists:galleries,id'],
            'description' => ['nullable', 'string'],
            'list_below_text' => ['nullable', 'string'],
            'travel_conditions_link' => ['nullable', 'string', 'max:2048'],
        ];
    }
}
