<?php

namespace App\Http\Requests\Admin\Blog;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBlogCategoryRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $translations = collect($this->input('translations', []))->mapWithKeys(function (array $translation, string $locale): array {
            return [$locale => [
                'name' => $translation['name'] ?? '',
                'seo_name' => $translation['seo_name'] ?? $translation['seoName'] ?? '',
                'seo_auto_generate' => $translation['seo_auto_generate'] ?? $translation['seoAutoGenerate'] ?? true,
            ]];
        })->all();

        $this->merge([
            'active' => $this->boolean('active', true),
            'column' => $this->input('column', '1'),
            'sort_order' => $this->input('sort_order', $this->input('sortOrder', 0)),
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
            'column' => ['required', 'string', Rule::in(['1', '2', '3'])],
            'sort_order' => ['integer', 'min:0'],
            'translations' => ['required', 'array'],
            'translations.hu.name' => ['required', 'string', 'max:255'],
            'translations.hu.seo_name' => ['nullable', 'string', 'max:255'],
            'translations.hu.seo_auto_generate' => ['boolean'],
            'translations.en.name' => ['required', 'string', 'max:255'],
            'translations.en.seo_name' => ['nullable', 'string', 'max:255'],
            'translations.en.seo_auto_generate' => ['boolean'],
            'translations.de.name' => ['required', 'string', 'max:255'],
            'translations.de.seo_name' => ['nullable', 'string', 'max:255'],
            'translations.de.seo_auto_generate' => ['boolean'],
        ];
    }
}
