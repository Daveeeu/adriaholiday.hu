<?php

namespace App\Http\Requests\Admin\Blog;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBlogArticleRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $translations = collect($this->input('translations', []))->mapWithKeys(function (array $translation, string $locale): array {
            return [$locale => [
                'title' => $translation['title'] ?? '',
                'seo_name' => $translation['seo_name'] ?? $translation['seoName'] ?? '',
                'seo_auto_generate' => $translation['seo_auto_generate'] ?? $translation['seoAutoGenerate'] ?? true,
                'excerpt' => $translation['excerpt'] ?? '',
                'content' => $translation['content'] ?? '',
            ]];
        })->all();

        $this->merge([
            'active' => $this->boolean('active', true),
            'show_on_homepage' => $this->boolean('show_on_homepage', $this->boolean('showOnHomepage', false)),
            'published_at' => $this->input('published_at', $this->input('publishedAt')),
            'image_title' => $this->input('image_title', $this->input('imageTitle')),
            'sort_order' => $this->input('sort_order', $this->input('sortOrder', 0)),
            'category_ids' => $this->input('category_ids', $this->input('categoryIds', [])),
            'tag_ids' => $this->input('tag_ids', $this->input('tagIds', [])),
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
            'published_at' => ['required', 'date'],
            'show_on_homepage' => ['boolean'],
            'image' => ['nullable', 'string', 'max:2048'],
            'image_title' => ['required', 'string', 'max:255'],
            'sort_order' => ['integer', 'min:0'],
            'category_ids' => ['required', 'array'],
            'category_ids.*' => ['integer', 'exists:blog_categories,id'],
            'tag_ids' => ['nullable', 'array'],
            'tag_ids.*' => ['integer', 'exists:blog_tags,id'],
            'translations' => ['required', 'array'],
            'translations.hu.title' => ['required', 'string', 'max:255'],
            'translations.hu.seo_name' => ['nullable', 'string', 'max:255'],
            'translations.hu.seo_auto_generate' => ['boolean'],
            'translations.hu.excerpt' => ['nullable', 'string'],
            'translations.hu.content' => ['required', 'string'],
            'translations.en.title' => ['required', 'string', 'max:255'],
            'translations.en.seo_name' => ['nullable', 'string', 'max:255'],
            'translations.en.seo_auto_generate' => ['boolean'],
            'translations.en.excerpt' => ['nullable', 'string'],
            'translations.en.content' => ['required', 'string'],
            'translations.de.title' => ['required', 'string', 'max:255'],
            'translations.de.seo_name' => ['nullable', 'string', 'max:255'],
            'translations.de.seo_auto_generate' => ['boolean'],
            'translations.de.excerpt' => ['nullable', 'string'],
            'translations.de.content' => ['required', 'string'],
        ];
    }
}
