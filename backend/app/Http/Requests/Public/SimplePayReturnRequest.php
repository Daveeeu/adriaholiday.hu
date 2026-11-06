<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

/**
 * What SimplePay appends to the URL the customer returns on: the signed,
 * Base64 encoded result (r) and its signature (s).
 */
class SimplePayReturnRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'r' => ['required', 'string', 'max:1024'],
            's' => ['required', 'string', 'max:256'],
        ];
    }
}
