<?php

namespace App\Http\Requests\Admin\PortfolioContent;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePortfolioContentBlockRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'draft_value' => $this->input('draft_value', $this->input('draftValue')),
            'draft_value_json' => $this->input('draft_value_json', $this->input('draftValueJson')),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'draft_value' => ['nullable', 'string'],
            'draft_value_json' => ['nullable', 'array'],
        ];
    }
}
