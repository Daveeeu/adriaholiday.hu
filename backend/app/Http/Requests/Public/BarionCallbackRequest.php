<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Barion's server-to-server notification that a payment changed. It only
 * carries the payment id; the state itself is always queried from Barion.
 */
class BarionCallbackRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'payment_id' => $this->input('paymentId', $this->input('PaymentId')),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_id' => ['required', 'string', 'max:64'],
        ];
    }
}
