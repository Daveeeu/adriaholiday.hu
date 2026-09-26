<?php

namespace App\Http\Requests\Admin\BookingFormTemplate;

use Illuminate\Validation\Rule;

class UpdateBookingFormTemplateRequest extends StoreBookingFormTemplateRequest
{
    public function rules(): array
    {
        $templateId = $this->route('bookingFormTemplate')?->id ?? $this->route('bookingFormTemplate');

        return [
            ...parent::rules(),
            'slug' => ['required', 'string', 'max:255', Rule::unique('booking_form_templates', 'slug')->ignore($templateId)],
        ];
    }
}
