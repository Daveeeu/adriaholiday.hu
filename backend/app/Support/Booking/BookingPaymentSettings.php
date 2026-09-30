<?php

namespace App\Support\Booking;

use App\Models\SiteSetting;
use App\Support\Payment\BookingPaymentKind;

/**
 * How much of a tour booking the customer pays online right after booking,
 * configured by admins in the "booking" site settings group: either the
 * whole total or a percentage of it as a deposit.
 */
final class BookingPaymentSettings
{
    public const GROUP = 'booking';

    /**
     * @var array<string, array{type: string, value: string|int|float|bool}>
     */
    public const DEFAULTS = [
        'online_payment_enabled' => ['type' => 'boolean', 'value' => true],
        'online_payment_kind' => ['type' => 'string', 'value' => BookingPaymentKind::FULL],
        'online_payment_deposit_percent' => ['type' => 'number', 'value' => 30],
        // Base Barion Pixel (fraud prevention), loaded by the public site on every page.
        'barion_pixel_id' => ['type' => 'string', 'value' => ''],
    ];

    public function __construct(
        public readonly bool $enabled,
        public readonly string $kind,
        public readonly float $depositPercent,
    ) {}

    public static function load(): self
    {
        $values = SiteSetting::valuesOf(self::GROUP, array_keys(self::DEFAULTS));
        $value = fn (string $key): mixed => $values->get($key) ?? self::DEFAULTS[$key]['value'];
        $kind = (string) $value('online_payment_kind');

        return new self(
            enabled: (bool) $value('online_payment_enabled'),
            kind: in_array($kind, BookingPaymentKind::all(), true) ? $kind : BookingPaymentKind::FULL,
            depositPercent: min(100.0, max(0.0, (float) $value('online_payment_deposit_percent'))),
        );
    }

    /**
     * The kind of payment taken online: a 100% "deposit" is a full payment.
     */
    public function effectiveKind(): string
    {
        return $this->kind === BookingPaymentKind::DEPOSIT && $this->depositPercent < 100
            ? BookingPaymentKind::DEPOSIT
            : BookingPaymentKind::FULL;
    }

    /**
     * The part of the booking total due online, rounded to what the
     * currency allows (whole forints).
     *
     * @return array{kind: string, amount: float}
     */
    public function amountDue(float $total, string $currency): array
    {
        $kind = $this->effectiveKind();
        $amount = $kind === BookingPaymentKind::DEPOSIT ? $total * $this->depositPercent / 100 : $total;

        return ['kind' => $kind, 'amount' => round($amount, $currency === 'HUF' ? 0 : 2)];
    }
}
