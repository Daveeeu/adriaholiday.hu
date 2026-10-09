<?php

namespace App\Services\Booking;

use App\Models\Coupon;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDateExtra;
use App\Models\TourDeparturePlace;
use App\Support\Booking\BookingInsuranceSettings;
use App\Support\Booking\TourBookingPassengerOptions;
use App\Support\Booking\TourBookingSelection;
use App\Support\DiscountBadge;
use App\Support\Tour\TourExtraChargeRule;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

/**
 * Prices a public tour booking on the server, so the stored total never
 * depends on what the browser calculated:
 *
 *   base price × passengers − discount (the price box's discount badge)
 *   + departure place fee × passengers
 *   + charged extras (for each passenger who has them, or once per booking)
 *   − coupon
 *   = trip total
 *   + travel insurance (daily fee × insured passengers × travel days)
 *   + cancellation insurance (percentage of each insured passenger's share of the trip total)
 *   = total
 *
 * Per-person extras and insurances are chosen passenger by passenger; the
 * breakdown lists which passengers (by their index) each one is charged for.
 * It is stored on the booking as a snapshot, so later price edits never
 * change what the customer booked.
 *
 * @phpstan-type BookingPriceExtraPassenger array{index: int, choice: string|null}
 * @phpstan-type BookingPriceExtra array{id: int, name: string, price: float, priceUnit: string, chargeRule: string, choice: string|null, quantity: int, total: float, passengers: array<int, BookingPriceExtraPassenger>}
 * @phpstan-type BookingPriceInsurance array{key: string, name: string, detail: string, total: float, passengers: array<int, int>}
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
        $passengerShares = $basePrice !== null
            ? $this->passengerShares($passengers, $basePrice, $discount, $departurePlace, $extras, $coupon)
            : null;

        $insurances = $this->insurances($tourDate, $selection, $passengerShares);
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

        if (array_diff($selection->referencedExtraIds(), $extras->pluck('id')->all()) !== []) {
            throw ValidationException::withMessages([
                'extraIds' => 'A kiválasztott felár nem érhető el ehhez az időponthoz.',
            ]);
        }

        return $extras
            ->map(fn (TourDateExtra $extra): ?array => TourExtraChargeRule::chargedPerPassenger($extra->charge_rule, $extra->price_unit)
                ? $this->passengerExtra($extra, $selection)
                : $this->bookingExtra($extra, $selection))
            ->filter()
            ->values()
            ->all();
    }

    /**
     * An extra charged once for the whole booking.
     *
     * @return BookingPriceExtra|null
     */
    private function bookingExtra(TourDateExtra $extra, TourBookingSelection $selection): ?array
    {
        $charged = TourExtraChargeRule::chargedAutomatically($extra->charge_rule, $selection->passengers)
            || (TourExtraChargeRule::selectable($extra->charge_rule, $selection->passengers) && in_array($extra->id, $selection->bookingExtraIds, true));

        if (! $charged) {
            return null;
        }

        return $this->extraLine($extra, 1, $this->extraChoice($extra, $selection->bookingExtraChoices[$extra->id] ?? null), []);
    }

    /**
     * A per-person extra, charged for every passenger when automatic, else
     * for the passengers who selected it.
     *
     * @return BookingPriceExtra|null
     */
    private function passengerExtra(TourDateExtra $extra, TourBookingSelection $selection): ?array
    {
        $automatic = TourExtraChargeRule::chargedAutomatically($extra->charge_rule, $selection->passengers);
        $selectable = TourExtraChargeRule::selectable($extra->charge_rule, $selection->passengers);
        $passengers = [];

        for ($index = 0; $index < $selection->passengers; $index++) {
            $options = $selection->optionsOf($index);

            if ($automatic || ($selectable && in_array($extra->id, $options->extraIds, true))) {
                $passengers[] = [
                    'index' => $index,
                    'choice' => $this->extraChoice($extra, $options->extraChoices[$extra->id] ?? null, $index),
                ];
            }
        }

        if ($passengers === []) {
            return null;
        }

        // The line names the choice when every passenger made the same one.
        $choices = array_unique(array_column($passengers, 'choice'));

        return $this->extraLine($extra, count($passengers), count($choices) === 1 ? $choices[0] : null, $passengers);
    }

    /**
     * @param  array<int, array{index: int, choice: string|null}>  $passengers
     * @return BookingPriceExtra
     */
    private function extraLine(TourDateExtra $extra, int $quantity, ?string $choice, array $passengers): array
    {
        return [
            'id' => $extra->id,
            'name' => $extra->name,
            'price' => (float) $extra->price,
            'priceUnit' => $extra->price_unit,
            'chargeRule' => $extra->charge_rule,
            'choice' => $choice,
            'quantity' => $quantity,
            'total' => (float) $extra->price * $quantity,
            'passengers' => $passengers,
        ];
    }

    /**
     * An extra offering choices (e.g. single room: alone / find a roommate)
     * needs one of them picked once it is charged.
     */
    private function extraChoice(TourDateExtra $extra, ?string $choice, ?int $passengerIndex = null): ?string
    {
        $choices = $extra->choices ?? [];

        if ($choices === []) {
            return null;
        }

        if (! in_array($choice, $choices, true)) {
            throw ValidationException::withMessages($passengerIndex === null
                ? ['extraChoices' => "Válassz egy lehetőséget ennél a tételnél: {$extra->name}."]
                : ["passengerOptions.{$passengerIndex}.extraChoices" => sprintf('Válassz egy lehetőséget ennél a tételnél: %s (%d. utas).', $extra->name, $passengerIndex + 1)]);
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
     * What each passenger's part of the trip total is: their own price,
     * departure fee and per-person extras, plus an equal part of the
     * discount, the per-booking extras and the coupon.
     *
     * @param  array{amount: float}|null  $discount
     * @param  array{total: float}|null  $departurePlace
     * @param  array<int, BookingPriceExtra>  $extras
     * @param  array{amount: float}|null  $coupon
     * @return array<int, float> keyed by passenger index
     */
    private function passengerShares(int $passengers, float $basePrice, ?array $discount, ?array $departurePlace, array $extras, ?array $coupon): array
    {
        $bookingExtrasTotal = array_sum(array_column(array_filter($extras, fn (array $extra): bool => $extra['passengers'] === []), 'total'));
        $shared = ($bookingExtrasTotal - ($discount['amount'] ?? 0) - ($coupon['amount'] ?? 0)) / $passengers;
        $shares = array_fill(0, $passengers, $basePrice + ($departurePlace['total'] ?? 0) / $passengers + $shared);

        foreach ($extras as $extra) {
            foreach ($extra['passengers'] as $passenger) {
                $shares[$passenger['index']] += $extra['price'];
            }
        }

        return $shares;
    }

    /**
     * @param  array<int, float>|null  $passengerShares  null when the tour has no price
     * @return array<int, BookingPriceInsurance>
     */
    private function insurances(?TourDate $tourDate, TourBookingSelection $selection, ?array $passengerShares): array
    {
        $settings = BookingInsuranceSettings::load();
        $travelInsured = $this->insuredPassengers($selection, fn (TourBookingPassengerOptions $options): bool => $options->travelInsurance);
        $cancellationInsured = $this->insuredPassengers($selection, fn (TourBookingPassengerOptions $options): bool => $options->cancellationInsurance);
        $insurances = [];

        if ($travelInsured !== []) {
            $days = $this->travelDays($tourDate);

            if ($days === null) {
                throw ValidationException::withMessages([
                    'travelInsurance' => 'Utasbiztosítás csak konkrét időpontra köthető.',
                ]);
            }

            $insurances[] = [
                'key' => 'travel_insurance',
                'name' => $settings->travelInsuranceName,
                'detail' => sprintf('%d fő × %d nap × %s Ft', count($travelInsured), $days, number_format($settings->travelInsuranceDailyFee, 0, ',', '.')),
                'total' => round($settings->travelInsuranceDailyFee * count($travelInsured) * $days),
                'passengers' => $travelInsured,
            ];
        }

        if ($cancellationInsured !== []) {
            if ($passengerShares === null || ! $this->cancellationInsuranceAvailable($tourDate, $settings)) {
                throw ValidationException::withMessages([
                    'cancellationInsurance' => "Útlemondási biztosítás legalább {$settings->cancellationInsuranceMinDays} nappal indulás előtt köthető.",
                ]);
            }

            $insurances[] = [
                'key' => 'cancellation_insurance',
                'name' => $settings->cancellationInsuranceName,
                'detail' => sprintf(
                    'Az utazás díjának %s%%-a, %d fő',
                    rtrim(rtrim(number_format($settings->cancellationInsurancePercent, 2, ',', ''), '0'), ','),
                    count($cancellationInsured),
                ),
                'total' => array_sum(array_map(
                    fn (int $index): float => round($passengerShares[$index] * $settings->cancellationInsurancePercent / 100),
                    $cancellationInsured,
                )),
                'passengers' => $cancellationInsured,
            ];
        }

        return $insurances;
    }

    /**
     * @param  callable(TourBookingPassengerOptions): bool  $chose
     * @return array<int, int> indexes of the passengers who chose the insurance
     */
    private function insuredPassengers(TourBookingSelection $selection, callable $chose): array
    {
        return array_values(array_filter(
            range(0, $selection->passengers - 1),
            fn (int $index): bool => $chose($selection->optionsOf($index)),
        ));
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
