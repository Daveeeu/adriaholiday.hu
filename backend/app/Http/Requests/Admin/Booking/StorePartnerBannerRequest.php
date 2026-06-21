<?php

namespace App\Http\Requests\Admin\Booking;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePartnerBannerRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => $this->input('name'),
            'url' => $this->input('url'),
            'image' => $this->input('image'),
            'width' => $this->input('width'),
            'height' => $this->input('height'),
            'embed_code' => $this->input('embed_code', $this->input('embedCode')),
            'status' => $this->input('status', 'draft'),
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:2048'],
            'image' => ['nullable', 'string', 'max:2048'],
            'width' => ['nullable', 'integer', 'min:0'],
            'height' => ['nullable', 'integer', 'min:0'],
            'embed_code' => ['nullable', 'string'],
            'status' => ['required', 'string', Rule::in(['draft', 'active', 'archived'])],
        ];
    }
}
