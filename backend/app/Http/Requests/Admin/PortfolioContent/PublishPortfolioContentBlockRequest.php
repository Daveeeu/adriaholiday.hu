<?php

namespace App\Http\Requests\Admin\PortfolioContent;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PublishPortfolioContentBlockRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'page' => $this->input('page', $this->query('page')),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page' => ['required', 'string', 'max:255'],
        ];
    }
}
