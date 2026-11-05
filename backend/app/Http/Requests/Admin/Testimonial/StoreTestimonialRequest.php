<?php

namespace App\Http\Requests\Admin\Testimonial;

use Illuminate\Foundation\Http\FormRequest;

class StoreTestimonialRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $author = trim((string) $this->input('author', ''));

        $this->merge([
            'title' => trim((string) $this->input('title', '')),
            'author' => $author !== '' ? $author : null,
            'published_at' => $this->input('published_at', $this->input('publishedAt')),
        ]);

        if ($this->has('showDate')) {
            $this->merge(['show_date' => $this->input('showDate')]);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'author' => ['nullable', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:100000'],
            'published_at' => ['required', 'date'],
            'show_date' => ['sometimes', 'boolean'],
            'active' => ['sometimes', 'boolean'],
        ];
    }
}
