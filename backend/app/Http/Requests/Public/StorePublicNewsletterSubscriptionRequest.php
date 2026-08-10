<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

class StorePublicNewsletterSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Az email cím megadása kötelező.',
            'email.email' => 'Adj meg egy érvényes email címet.',
            'email.max' => 'A megadott email cím túl hosszú.',
        ];
    }
}
