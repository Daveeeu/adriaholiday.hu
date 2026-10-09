<?php

namespace App\Http\Requests\Admin\Tour;

use Illuminate\Foundation\Http\FormRequest;

class SuggestTourSearchKeywordsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) ($this->user()?->can('tours.create') || $this->user()?->can('tours.update'));
    }

    public function rules(): array
    {
        return [
            'shortDescription' => ['nullable', 'string', 'max:10000'],
        ];
    }
}
