<?php

namespace App\Http\Requests\Public;

use App\Support\Apartment\ApartmentLayout;
use App\Support\Apartment\ApartmentServiceCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * The apartment search of a location page: code, guests, layouts, stars and
 * services, a page of the results.
 */
class PortfolioApartmentSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'per_page' => $this->input('per_page', $this->input('perPage')),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'code' => ['nullable', 'string', 'max:20'],
            'guests' => ['nullable', 'integer', 'min:1', 'max:30'],
            'layouts' => ['nullable', 'array', 'max:5'],
            'layouts.*' => ['string', Rule::in(ApartmentLayout::letters())],
            'stars' => ['nullable', 'array', 'max:6'],
            'stars.*' => ['integer', 'between:0,5'],
            'services' => ['nullable', 'array', 'max:10'],
            'services.*' => ['string', Rule::in(ApartmentServiceCatalog::keys())],
            'page' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ];
    }
}
