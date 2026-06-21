<?php

namespace App\Http\Requests\Admin\Blog;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBlogTagRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $translations = collect($this->input('translations', []))->mapWithKeys(function (array $translation, string $locale): array {
            return [$locale => [
                'name' => $translation['name'] ?? '',
            ]];
        })->all();

        $this->merge([
            'active' => $this->boolean('active', true),
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
            'sort_order' => ['integer', 'min:0'],
            'translations' => ['required', 'array'],
            'translations.hu.name' => ['required', 'string', 'max:255'],
            'translations.en.name' => ['required', 'string', 'max:255'],
            'translations.de.name' => ['required', 'string', 'max:255'],
        ];
    }
}
