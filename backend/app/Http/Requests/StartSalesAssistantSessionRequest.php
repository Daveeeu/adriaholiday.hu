<?php

namespace App\Http\Requests;

use App\Services\SalesAssistant\SalesAssistantSessionService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Http\FormRequest;

class StartSalesAssistantSessionRequest extends FormRequest
{
    /**
     * When the demo is protected by an access code, only a matching code
     * starts a conversation.
     */
    public function authorize(SalesAssistantSessionService $sessions): bool
    {
        $code = $this->input('accessCode');

        return $sessions->acceptsAccessCode(is_string($code) ? $code : null);
    }

    public function rules(): array
    {
        return [
            'accessCode' => ['nullable', 'string', 'max:100'],
        ];
    }

    protected function failedAuthorization(): void
    {
        throw new AuthorizationException('Érvénytelen hozzáférési kód.');
    }
}
