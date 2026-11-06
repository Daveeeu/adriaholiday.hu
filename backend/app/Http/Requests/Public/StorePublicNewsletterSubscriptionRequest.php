<?php

namespace App\Http\Requests\Public;

use App\Models\NewsletterSubscriber;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'audience' => ['sometimes', 'string', Rule::in(NewsletterSubscriber::AUDIENCES)],
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
