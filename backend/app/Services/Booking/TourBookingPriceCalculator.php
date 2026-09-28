<?php

namespace App\Services\Booking;

use App\Models\Coupon;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDateExtra;
use App\Models\TourDeparturePlace;
use App\Support\Booking\BookingInsuranceSettings;
use App\Support\Booking\TourBookingSelection;
use App\Support\DiscountBadge;
use App\Support\Tour\TourExtraChargeRule;
use App\Support\Tour\TourExtraPriceUnit;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

/**
 * Prices a public tour booking on the server, so the stored total never
 * depends on what the browser calculated:
 *
 *   base price × passengers − discount (the price box's discount badge)
 *   + departure place fee × passengers
 *   + charged extras (per passenger or once per booking)
 *   − coupon
 *   = trip total
 *   + travel insurance (daily fee × passengers × travel days)
 *   + cancellation insurance (percentage of the trip total)
 *   = total
 *
 * The returned breakdown is stored on the booking as a snapshot, so later
 * price edits never change what the customer booked.
 *
 * @phpstan-type BookingPriceExtra array{id: int, name: string, price: float, priceUnit: string, chargeRule: string, choice: string|null, quantity: int, total: float}
 * @phpstan-type BookingPriceInsurance array{key: string, name: string, detail: string, total: float}
 * @phpstan-type BookingPriceBreakdown array{currency: string, passengers: int, basePrice: float|null, baseTotal: float|null, discount: array{label: string, percent: float, amount: float}|null, departurePlace: array{id: int, name: string, fee: float, total: float}|null, extras: array<int, BookingPriceExtra>, coupon: array{id: int, code: string, amount: float}|null, tripTotal: float|null, insurances: array<int, BookingPriceInsurance>, insuranceTotal: float, total: float|null}
 */
class TourBookingPriceCalculator
{
    /**
     * @return BookingPriceBreakdown
     *
     * @throws ValidationException when a choice does not fit the tour, its date or the booking
     */
    public function calculate(Tour $tour, ?TourDate $tourDate, TourBookingSelection $selection): array
    {
        $passengers = $selection->passengers;
        $basePrice = $this->basePrice($tour, $tourDate);
        $baseTotal = $basePrice !== null ? $basePrice * $passengers : null;
        $discount = $this->discount($tour, $tourDate, $baseTotal);
        $departurePlace = $this->departurePlace($tour, $selection->departurePlaceId, $passengers);
        $extras = $this->extras($tourDate, $selection);

        $subtotal = $baseTotal !== null
            ? $baseTotal - ($discount['amount'] ?? 0) + ($departurePlace['total'] ?? 0) + array_sum(array_column($extras, 'total'))
            : null;
        $coupon = $this->coupon($tour, $selection->couponCode, $subtotal);
        $tripTotal = $subtotal !== null ? $subtotal - ($coupon['amount'] ?? 0) : null;

        $insurances = $this->insurances($tourDate, $selection, $tripTotal);
        $insuranceTotal = array_sum(array_column($insurances, 'total'));

        return [
            'currency' => $tour->price_box_currency ?: 'HUF',
            'passengers' => $passengers,
            'basePrice' => $basePrice,
            'baseTotal' => $baseTotal,
            'discount' => $discount,
            'departurePlace' => $departurePlace,
            'extras' => $extras,
            'coupon' => $coupon,
            'tripTotal' => $tripTotal,
            'insurances' => $insurances,
            'insuranceTotal' => $insuranceTotal,
            'total' => $tripTotal !== null ? $tripTotal + $insuranceTotal : null,
        ];
    }

    /**
     * Same precedence as the public price box: the date's price, else the tour's.
     */
    private function basePrice(Tour $tour, ?TourDate $tourDate): ?float
    {
        $price = $tourDate?->price_box_price ?? $tourDate?->price ?? $tour->price_box_price ?? $tour->price;

        return $price !== null ? (float) $price : null;
    }

    /**
     * The discount badge the public price box applies (the date's badge
     * overrides the tour's), e.g. a Last Minute discount.
     *
     * @return array{label: string, percent: float, amount: float}|null
     */
    private function discount(Tour $tour, ?TourDate $tourDate, ?float $baseTotal): ?array
    {
        $badge = filled($tourDate?->price_box_discount_badge) ? $tourDate->price_box_discount_badge : $tour->price_box_discount_badge;
        $percent = DiscountBadge::percent($badge);

        if ($percent === null || $baseTotal === null) {
            return null;
        }

        return [
            'label' => $tour->price_box_discount_text ?: 'Kedvezmény',
            'percent' => $percent,
            'amount' => round($baseTotal * $percent / 100),
        ];
    }

    /**
     * A tour offering departure places requires the customer to pick one of
     * its active places. The per-tour fee overrides the place's general fee.
     *
     * @return array{id: int, name: string, fee: float, total: float}|null
     */
    private function departurePlace(Tour $tour, ?int $departurePlaceId, int $passengers): ?array
    {
        $places = $tour->departurePlaces()->where('active', true)->get();

        if ($places->isEmpty()) {
            return null;
        }

        /** @var TourDeparturePlace|null $place */
        $place = $departurePlaceId !== null ? $places->firstWhere('id', $departurePlaceId) : null;

        if ($place === null) {
            throw ValidationException::withMessages([
                'departurePlaceId' => 'Válassz felszállási helyet az utazáshoz.',
            ]);
        }

        $fee = (float) ($place->pivot->fee ?? $place->fee ?? 0);

        return [
            'id' => $place->id,
            'name' => $place->name,
            'fee' => $fee,
            'total' => $fee * $passengers,
        ];
    }

    /**
     * @return array<int, BookingPriceExtra>
     */
    private function extras(?TourDate $tourDate, TourBookingSelection $selection): array
    {
        /** @var Collection<int, TourDateExtra> $extras */
        $extras = $tourDate?->extras()->get() ?? collect();

        if (array_diff($selection->extraIds, $extras->pluck('id')->all()) !== []) {
            throw ValidationException::withMessages([
                'extraIds' => 'A kiválasztott felár nem érhető el ehhez az időponthoz.',
            ]);
        }

        return $extras
            ->filter(fn (TourDateExtra $extra): bool => TourExtraChargeRule::chargedAutomatically($extra->charge_rule, $selection->passengers)
                || (TourExtraChargeRule::selectable($extra->charge_rule) && in_array($extra->id, $selection->extraIds, true)))
            ->map(function (TourDateExtra $extra) use ($selection): array {
                $quantity = $extra->price_unit === TourExtraPriceUnit::PER_BOOKING ? 1 : $selection->passengers;

                return [
                    'id' => $extra->id,
                    'name' => $extra->name,
                    'price' => (float) $extra->price,
                    'priceUnit' => $extra->price_unit,
                    'chargeRule' => $extra->charge_rule,
                    'choice' => $this->extraChoice($extra, $selection),
                    'quantity' => $quantity,
                    'total' => (float) $extra->price * $quantity,
                ];
            })
            ->values()
            ->all();
    }

    /**
     * An extra offering choices (e.g. single room: alone / find a roommate)
     * needs one of them picked once it is charged.
     */
    private function extraChoice(TourDateExtra $extra, TourBookingSelection $selection): ?string
    {
        $choices = $extra->choices ?? [];

        if ($choices === []) {
            return null;
        }

        $choice = $selection->extraChoices[$extra->id] ?? null;

        if (! in_array($choice, $choices, true)) {
            throw ValidationException::withMessages([
                'extraChoices' => "Válassz egy lehetőséget ennél a tételnél: {$extra->name}.",
            ]);
        }

        return $choice;
    }

    /**
     * An active, unused, unexpired coupon reduces the trip total by its
     * value (never below zero) on tours that accept coupons.
     *
     * @return array{id: int, code: string, amount: float}|null
     */
    private function coupon(Tour $tour, ?string $code, ?float $subtotal): ?array
    {
        if ($code === null) {
            return null;
        }

        $coupon = $tour->couponable
            ? Coupon::query()
                ->where('code', $code)
                ->where('active', true)
                ->where('used', false)
                ->where(fn ($query) => $query->whereNull('expires_at')->orWhereDate('expires_at', '>=', today()))
                ->first()
            : null;

        if ($coupon === null) {
            throw ValidationException::withMessages([
                'couponCode' => 'A megadott kuponkód érvénytelen, lejárt vagy már fel lett használva.',
            ]);
        }

        return [
            'id' => $coupon->id,
            'code' => $coupon->code,
            'amount' => min((float) $coupon->value, max(0.0, (float) $subtotal)),
        ];
    }

    /**
     * @return array<int, BookingPriceInsurance>
     */
    private function insurances(?TourDate $tourDate, TourBookingSelection $selection, ?float $tripTotal): array
    {
        $settings = BookingInsuranceSettings::load();
        $insurances = [];

        if ($selection->travelInsurance) {
            $days = $this->travelDays($tourDate);

            if ($days === null) {
                throw ValidationException::withMessages([
                    'travelInsurance' => 'Utasbiztosítás csak konkrét időpontra köthető.',
                ]);
            }

            $insurances[] = [
                'key' => 'travel_insurance',
                'name' => $settings->travelInsuranceName,
                'detail' => sprintf('%d fő × %d nap × %s Ft', $selection->passengers, $days, number_format($settings->travelInsuranceDailyFee, 0, ',', '.')),
                'total' => round($settings->travelInsuranceDailyFee * $selection->passengers * $days),
            ];
        }

        if ($selection->cancellationInsurance) {
            if ($tripTotal === null || ! $this->cancellationInsuranceAvailable($tourDate, $settings)) {
                throw ValidationException::withMessages([
                    'cancellationInsurance' => "Útlemondási biztosítás legalább {$settings->cancellationInsuranceMinDays} nappal indulás előtt köthető.",
                ]);
            }

            $insurances[] = [
                'key' => 'cancellation_insurance',
                'name' => $settings->cancellationInsuranceName,
                'detail' => sprintf('Az utazás díjának %s%%-a', rtrim(rtrim(number_format($settings->cancellationInsurancePercent, 2, ',', ''), '0'), ',')),
                'total' => round($tripTotal * $settings->cancellationInsurancePercent / 100),
            ];
        }

        return $insurances;
    }

    private function travelDays(?TourDate $tourDate): ?int
    {
        if ($tourDate?->start_date === null) {
            return null;
        }

        $end = $tourDate->end_date ?? $tourDate->start_date;

        return (int) $tourDate->start_date->diffInDays($end) + 1;
    }

    private function cancellationInsuranceAvailable(?TourDate $tourDate, BookingInsuranceSettings $settings): bool
    {
        return $tourDate?->start_date !== null
            && today()->diffInDays($tourDate->start_date, false) >= $settings->cancellationInsuranceMinDays;
    }
}
