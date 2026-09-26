<?php

namespace App\Http\Requests\Admin\Tour\Concerns;

use App\Support\Tour\TourExtraPriceUnit;
use Illuminate\Validation\Rule;

/**
 * Input normalization and rules for the priced extras nested under each
 * tour date, shared by the tour store and update requests.
 */
trait ValidatesTourDateExtras
{
    /**
     * @param  array<int, array<string, mixed>>  $extras
     * @return array<int, array<string, mixed>>
     */
    protected function normalizeDateExtras(array $extras): array
    {
        return collect($extras)
            ->values()
            ->map(fn (array $extra, int $index): array => [
                'name' => $extra['name'] ?? '',
                'price' => $extra['price'] ?? null,
                'price_unit' => $extra['price_unit'] ?? $extra['priceUnit'] ?? TourExtraPriceUnit::PER_PERSON,
                'mandatory' => filter_var($extra['mandatory'] ?? false, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false,
                'sort_order' => $extra['sort_order'] ?? $extra['sortOrder'] ?? ($index + 1),
            ])
            ->all();
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    protected function dateExtraRules(): array
    {
        return [
            'dates.*.extras' => ['nullable', 'array', 'max:30'],
            'dates.*.extras.*.name' => ['required', 'string', 'max:255'],
            'dates.*.extras.*.price' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'dates.*.extras.*.price_unit' => ['required', 'string', Rule::in(TourExtraPriceUnit::all())],
            'dates.*.extras.*.mandatory' => ['boolean'],
            'dates.*.extras.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
