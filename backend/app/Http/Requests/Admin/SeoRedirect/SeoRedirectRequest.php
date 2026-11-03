<?php

namespace App\Http\Requests\Admin\SeoRedirect;

use App\Models\SeoRedirect;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * The redirect form, for creating and editing alike.
 */
class SeoRedirectRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'source_path' => SeoRedirect::normalizePath((string) $this->input('source_path', $this->input('sourcePath', ''))),
            'target' => trim((string) $this->input('target', '')),
            'active' => $this->boolean('active', true),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var SeoRedirect|null $redirect */
        $redirect = $this->route('seoRedirect');

        return [
            'source_path' => ['required', 'string', 'max:512', Rule::unique('seo_redirects', 'source_path')->ignore($redirect?->id)],
            'target' => ['required', 'string', 'max:1024', 'regex:~^(/|https?://)~i', 'different:source_path'],
            'active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return ['target.regex' => 'A cél egy "/"-rel kezdődő oldalcím vagy egy teljes http(s) cím legyen.'];
    }
}
