<?php

namespace App\Http\Requests\Public;

use Illuminate\Foundation\Http\FormRequest;

/**
 * The visitor's earlier views (offer slugs, most recent first), sent only
 * when they allowed personalised offers.
 */
class PortfolioRelatedOffersRequest extends FormRequest
{
    public const MAX_VIEWED = 10;

    protected function prepareForValidation(): void
    {
        $viewed = $this->query('viewed');

        $this->merge([
            'viewed' => is_string($viewed) ? array_values(array_filter(explode(',', $viewed))) : [],
        ]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'viewed' => ['array', 'max:'.self::MAX_VIEWED],
            'viewed.*' => ['string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
        ];
    }

    /**
     * @return array<int, string>
     */
    public function viewedSlugs(): array
    {
        return array_values(array_unique($this->validated('viewed') ?? []));
    }
}
