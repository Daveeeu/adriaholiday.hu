<?php

namespace App\Http\Requests\Admin\HomepageOffer;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreHomepageOfferRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $translations = collect($this->input('translations', []))->mapWithKeys(function (array $translation, string $locale): array {
            return [$locale => [
                'name' => $translation['name'] ?? '',
                'seo_name' => $translation['seo_name'] ?? $translation['seoName'] ?? '',
                'seo_auto_generate' => $translation['seo_auto_generate'] ?? $translation['seoAutoGenerate'] ?? true,
                'short_description' => $translation['short_description'] ?? $translation['shortDescription'] ?? null,
            ]];
        })->all();

        $this->merge([
            'active' => $this->boolean('active', true),
            'sort_order' => $this->input('sort_order', $this->input('sortOrder', 0)),
            'image_title' => $this->input('image_title', $this->input('imageTitle')),
            'translations' => $translations,
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
            'active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
            'image' => ['nullable', 'string', 'max:2048'],
            'image_title' => ['required', 'string', 'max:255'],
            'link' => ['required', 'string', 'max:2048'],
            'translations' => ['required', 'array'],
            'translations.hu.name' => ['required', 'string', 'max:255'],
            'translations.hu.seo_name' => ['nullable', 'string', 'max:255'],
            'translations.hu.seo_auto_generate' => ['boolean'],
            'translations.hu.short_description' => ['nullable', 'string'],
            'translations.en.name' => ['required', 'string', 'max:255'],
            'translations.en.seo_name' => ['nullable', 'string', 'max:255'],
            'translations.en.seo_auto_generate' => ['boolean'],
            'translations.en.short_description' => ['nullable', 'string'],
            'translations.de.name' => ['required', 'string', 'max:255'],
            'translations.de.seo_name' => ['nullable', 'string', 'max:255'],
            'translations.de.seo_auto_generate' => ['boolean'],
            'translations.de.short_description' => ['nullable', 'string'],
        ];
    }
}
