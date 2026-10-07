<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactMessageRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim((string) $this->input('name', '')),
            'email' => trim((string) $this->input('email', '')),
            'phone' => trim((string) $this->input('phone', '')) ?: null,
            'message' => trim((string) $this->input('message', '')),
            'privacy_accepted' => $this->boolean('privacyAccepted', $this->boolean('privacy_accepted')),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190'],
            'phone' => ['nullable', 'string', 'max:40'],
            'message' => ['required', 'string', 'min:5', 'max:5000'],
            'privacy_accepted' => ['accepted'],
            // Honeypot: hidden from people, filled in by bots.
            'website' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Kérjük, add meg a neved.',
            'email.required' => 'Kérjük, add meg az e-mail-címed.',
            'email.email' => 'Kérjük, valós e-mail-címet adj meg.',
            'message.required' => 'Kérjük, írd meg az üzeneted.',
            'message.min' => 'Az üzenet túl rövid.',
            'privacy_accepted.accepted' => 'Az üzenetküldéshez el kell fogadnod az adatkezelési tájékoztatót.',
        ];
    }
}
