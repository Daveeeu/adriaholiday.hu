<?php

namespace App\Http\Requests\Admin\Tour\Concerns;

use App\Support\Tour\TourExtraChargeRule;
use App\Support\Tour\TourExtraPriceUnit;
use Illuminate\Validation\Rule;

/**
 * Input normalization and rules for a tour's booking options — the priced
 * extras nested under each date and the per-tour departure place fees —
 * shared by the tour store and update requests.
 */
trait ValidatesTourBookingOptions
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
                'charge_rule' => $extra['charge_rule'] ?? $extra['chargeRule'] ?? TourExtraChargeRule::OPTIONAL,
                // Accepts a list or one choice per line (the admin form's textarea).
                'choices' => collect(is_string($extra['choices'] ?? null) ? preg_split('/\R/', $extra['choices']) : ($extra['choices'] ?? []))
                    ->map(fn (mixed $choice): string => trim((string) $choice))
                    ->filter()
                    ->values()
                    ->all(),
                'sort_order' => $extra['sort_order'] ?? $extra['sortOrder'] ?? ($index + 1),
            ])
            ->all();
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    protected function bookingOptionRules(): array
    {
        return [
            'departure_place_fees' => ['nullable', 'array'],
            'departure_place_fees.*' => ['nullable', 'numeric', 'min:0', 'max:99999999'],
            'dates.*.extras' => ['nullable', 'array', 'max:30'],
            'dates.*.extras.*.name' => ['required', 'string', 'max:255'],
            'dates.*.extras.*.price' => ['required', 'numeric', 'min:0', 'max:99999999'],
            'dates.*.extras.*.price_unit' => ['required', 'string', Rule::in(TourExtraPriceUnit::all())],
            'dates.*.extras.*.charge_rule' => ['required', 'string', Rule::in(TourExtraChargeRule::all())],
            'dates.*.extras.*.choices' => ['array', 'max:5'],
            'dates.*.extras.*.choices.*' => ['string', 'max:255', 'distinct'],
            'dates.*.extras.*.sort_order' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
