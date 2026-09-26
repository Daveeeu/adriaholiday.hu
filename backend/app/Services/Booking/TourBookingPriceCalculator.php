<?php

namespace App\Services\Booking;

use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDateExtra;
use App\Models\TourDeparturePlace;
use App\Support\Tour\TourExtraPriceUnit;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

/**
 * Prices a public tour booking on the server, so the stored total never
 * depends on what the browser calculated: base price per passenger, the
 * departure place fee per passenger, and every mandatory or selected extra
 * of the chosen date (per passenger or once per booking).
 *
 * The returned breakdown is stored on the booking as a snapshot, so later
 * price edits on the tour never change what the customer booked.
 *
 * @phpstan-type BookingPriceExtra array{id: int, name: string, price: float, priceUnit: string, mandatory: bool, quantity: int, total: float}
 * @phpstan-type BookingPriceDeparturePlace array{id: int, name: string, fee: float, total: float}
 * @phpstan-type BookingPriceBreakdown array{currency: string, passengers: int, basePrice: float|null, baseTotal: float|null, departurePlace: BookingPriceDeparturePlace|null, extras: array<int, BookingPriceExtra>, total: float|null}
 */
class TourBookingPriceCalculator
{
    /**
     * @param  array<int, int>  $selectedExtraIds
     * @return BookingPriceBreakdown
     *
     * @throws ValidationException when the departure place or an extra does not belong to the tour date
     */
    public function calculate(Tour $tour, ?TourDate $tourDate, int $passengers, ?int $departurePlaceId, array $selectedExtraIds): array
    {
        $passengers = max(1, $passengers);
        $basePrice = $this->basePrice($tour, $tourDate);
        $baseTotal = $basePrice !== null ? $basePrice * $passengers : null;

        $departurePlace = $this->departurePlace($tour, $departurePlaceId);
        $departurePlaceLine = $departurePlace !== null ? [
            'id' => $departurePlace->id,
            'name' => $departurePlace->name,
            'fee' => (float) ($departurePlace->fee ?? 0),
            'total' => (float) ($departurePlace->fee ?? 0) * $passengers,
        ] : null;

        $extraLines = $this->extras($tourDate, $selectedExtraIds)
            ->map(function (TourDateExtra $extra) use ($passengers): array {
                $quantity = $extra->price_unit === TourExtraPriceUnit::PER_BOOKING ? 1 : $passengers;

                return [
                    'id' => $extra->id,
                    'name' => $extra->name,
                    'price' => (float) $extra->price,
                    'priceUnit' => $extra->price_unit,
                    'mandatory' => (bool) $extra->mandatory,
                    'quantity' => $quantity,
                    'total' => (float) $extra->price * $quantity,
                ];
            })
            ->values()
            ->all();

        $total = $baseTotal !== null
            ? $baseTotal + ($departurePlaceLine['total'] ?? 0) + array_sum(array_column($extraLines, 'total'))
            : null;

        return [
            'currency' => $tour->price_box_currency ?: 'HUF',
            'passengers' => $passengers,
            'basePrice' => $basePrice,
            'baseTotal' => $baseTotal,
            'departurePlace' => $departurePlaceLine,
            'extras' => $extraLines,
            'total' => $total,
        ];
    }

    private function basePrice(Tour $tour, ?TourDate $tourDate): ?float
    {
        $price = $tourDate !== null
            ? ($tourDate->price_box_price ?? $tourDate->price)
            : ($tour->price_box_price ?? $tour->price);

        return $price !== null ? (float) $price : null;
    }

    /**
     * A tour offering departure places requires the customer to pick one of
     * its active places; tours without departure places ignore the input.
     */
    private function departurePlace(Tour $tour, ?int $departurePlaceId): ?TourDeparturePlace
    {
        $places = $tour->departurePlaces()->where('active', true)->get();

        if ($places->isEmpty()) {
            return null;
        }

        $place = $departurePlaceId !== null ? $places->firstWhere('id', $departurePlaceId) : null;

        if ($place === null) {
            throw ValidationException::withMessages([
                'departurePlaceId' => 'Válassz felszállási helyet az utazáshoz.',
            ]);
        }

        return $place;
    }

    /**
     * Mandatory extras are always charged; optional ones only when selected.
     *
     * @param  array<int, int>  $selectedExtraIds
     * @return Collection<int, TourDateExtra>
     */
    private function extras(?TourDate $tourDate, array $selectedExtraIds): Collection
    {
        $extras = $tourDate?->extras()->get() ?? collect();
        $selectedExtraIds = array_values(array_unique(array_map('intval', $selectedExtraIds)));

        $unknownIds = array_diff($selectedExtraIds, $extras->pluck('id')->all());

        if ($unknownIds !== []) {
            throw ValidationException::withMessages([
                'extraIds' => 'A kiválasztott felár nem érhető el ehhez az időponthoz.',
            ]);
        }

        return $extras->filter(
            fn (TourDateExtra $extra): bool => $extra->mandatory || in_array($extra->id, $selectedExtraIds, true),
        );
    }
}
