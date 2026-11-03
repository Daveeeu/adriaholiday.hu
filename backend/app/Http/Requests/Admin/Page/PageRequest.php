<?php

namespace App\Http\Requests\Admin\Page;

use App\Models\Page;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * The page form, for creating and editing alike. Text blocks have no address.
 */
class PageRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $slug = trim((string) $this->input('slug', ''), " /\t\n");

        $this->merge([
            'kind' => $this->input('kind', Page::KIND_PAGE),
            'slug' => $slug !== '' ? $slug : null,
            'seo_title' => $this->input('seo_title', $this->input('seoTitle')),
            'seo_description' => $this->input('seo_description', $this->input('seoDescription')),
            'seo_robots' => $this->input('seo_robots', $this->input('seoRobots')),
            'active' => $this->boolean('active'),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Page|null $page */
        $page = $this->route('page');

        return [
            'kind' => ['required', Rule::in(Page::KINDS)],
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                Rule::requiredIf($this->input('kind') === Page::KIND_PAGE),
                'nullable',
                'string',
                'max:255',
                'regex:~^[^/?#\s]+$~u',
                Rule::unique('pages', 'slug')->ignore($page?->id),
            ],
            'content' => ['nullable', 'string', 'max:500000'],
            'seo_title' => ['nullable', 'string', 'max:255'],
            'seo_description' => ['nullable', 'string', 'max:512'],
            'seo_robots' => ['nullable', 'string', 'max:64'],
            'active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return ['slug.regex' => 'Az oldal címe egyetlen szakasz legyen, perjel, kérdőjel és szóköz nélkül.'];
    }
}
