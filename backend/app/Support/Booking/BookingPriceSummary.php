<?php

namespace App\Support\Booking;

use App\Models\Booking;
use App\Support\Tour\TourExtraChargeRule;

/**
 * Readable form of the server-calculated price breakdown stored with a tour
 * booking (payload.pricing), shared by the booking e-mails.
 */
final class BookingPriceSummary
{
    /**
     * @param  array<string, mixed>  $pricing
     */
    private function __construct(private readonly array $pricing) {}

    public static function of(Booking $booking): ?self
    {
        $pricing = $booking->payload['pricing'] ?? null;

        return is_array($pricing) ? new self($pricing) : null;
    }

    /**
     * One line per item with its calculation, e.g. "Egyágyas felár: 1 × 8.900 Ft = 8.900 Ft".
     *
     * @return array<int, string>
     */
    public function lines(): array
    {
        $lines = [];

        if ($this->pricing['basePrice'] !== null) {
            $lines[] = sprintf('Részvételi díj: %d fő × %s = %s', $this->pricing['passengers'], $this->format($this->pricing['basePrice']), $this->format($this->pricing['baseTotal']));
        }

        if ($this->pricing['discount'] !== null) {
            $lines[] = sprintf('%s (-%s%%): -%s', $this->pricing['discount']['label'], $this->pricing['discount']['percent'], $this->format($this->pricing['discount']['amount']));
        }

        if ($this->pricing['departurePlace'] !== null) {
            $place = $this->pricing['departurePlace'];
            $lines[] = $place['total'] > 0
                ? sprintf('Felszállás: %s – %s', $place['name'], $this->format($place['total']))
                : sprintf('Felszállás: %s', $place['name']);
        }

        foreach ($this->pricing['extras'] as $extra) {
            $lines[] = sprintf(
                '%s%s: %d × %s = %s%s',
                $extra['name'],
                $extra['chargeRule'] === TourExtraChargeRule::MANDATORY ? ' (kötelező)' : '',
                $extra['quantity'],
                $this->format($extra['price']),
                $this->format($extra['total']),
                $extra['choice'] !== null ? " – {$extra['choice']}" : '',
            );
        }

        if ($this->pricing['coupon'] !== null) {
            $lines[] = sprintf('Kupon (%s): -%s', $this->pricing['coupon']['code'], $this->format($this->pricing['coupon']['amount']));
        }

        foreach ($this->pricing['insurances'] as $insurance) {
            $lines[] = sprintf('%s (%s): %s', $insurance['name'], $insurance['detail'], $this->format($insurance['total']));
        }

        return $lines;
    }

    /**
     * The charged items as label/amount pairs for a price table; free items are left out.
     *
     * @return array<int, array{label: string, amount: string}>
     */
    public function rows(): array
    {
        $rows = [];

        if ($this->pricing['basePrice'] !== null) {
            $rows[] = ['label' => sprintf('Részvételi díj (%d fő × %s)', $this->pricing['passengers'], $this->format($this->pricing['basePrice'])), 'amount' => $this->format($this->pricing['baseTotal'])];
        }

        if ($this->pricing['discount'] !== null) {
            $rows[] = ['label' => sprintf('%s (-%s%%)', $this->pricing['discount']['label'], $this->pricing['discount']['percent']), 'amount' => '-'.$this->format($this->pricing['discount']['amount'])];
        }

        if (($this->pricing['departurePlace']['total'] ?? 0) > 0) {
            $rows[] = ['label' => 'Felszállási díj ('.$this->pricing['departurePlace']['name'].')', 'amount' => $this->format($this->pricing['departurePlace']['total'])];
        }

        foreach ($this->pricing['extras'] as $extra) {
            $rows[] = [
                'label' => sprintf('%s (%d × %s)%s', $extra['name'], $extra['quantity'], $this->format($extra['price']), $extra['choice'] !== null ? " – {$extra['choice']}" : ''),
                'amount' => $this->format($extra['total']),
            ];
        }

        if ($this->pricing['coupon'] !== null) {
            $rows[] = ['label' => 'Kupon ('.$this->pricing['coupon']['code'].')', 'amount' => '-'.$this->format($this->pricing['coupon']['amount'])];
        }

        foreach ($this->pricing['insurances'] as $insurance) {
            $rows[] = ['label' => $insurance['name'].' ('.$insurance['detail'].')', 'amount' => $this->format($insurance['total'])];
        }

        return $rows;
    }

    /**
     * @return array<int, string> names of the insurances ordered with the booking
     */
    public function insuranceNames(): array
    {
        return array_column($this->pricing['insurances'], 'name');
    }

    public function departurePlaceName(): ?string
    {
        return $this->pricing['departurePlace']['name'] ?? null;
    }

    public function totalAmount(): ?float
    {
        return isset($this->pricing['total']) ? (float) $this->pricing['total'] : null;
    }

    public function total(): ?string
    {
        $total = $this->totalAmount();

        return $total !== null ? $this->format($total) : null;
    }

    public function format(float $amount): string
    {
        $currency = strtoupper((string) ($this->pricing['currency'] ?? 'HUF'));

        return number_format($amount, 0, ',', '.').' '.($currency === 'HUF' ? 'Ft' : $currency);
    }
}
