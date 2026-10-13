<?php

namespace App\Support\Booking;

use App\Models\SiteSetting;

/**
 * Whether tour bookings can be paid online, configured by admins in the
 * "booking" site settings group. What is paid online is always the deposit,
 * the first instalment of BookingPaymentSchedule.
 */
final class BookingPaymentSettings
{
    public const GROUP = 'booking';

    /**
     * @var array<string, array{type: string, value: string|int|float|bool}>
     */
    public const DEFAULTS = [
        'online_payment_enabled' => ['type' => 'boolean', 'value' => true],
        // Base Barion Pixel (fraud prevention), loaded by the public site on every page.
        'barion_pixel_id' => ['type' => 'string', 'value' => ''],
    ];

    public function __construct(public readonly bool $enabled) {}

    public static function load(): self
    {
        $values = SiteSetting::valuesOf(self::GROUP, ['online_payment_enabled']);

        return new self((bool) ($values->get('online_payment_enabled') ?? self::DEFAULTS['online_payment_enabled']['value']));
    }
}
