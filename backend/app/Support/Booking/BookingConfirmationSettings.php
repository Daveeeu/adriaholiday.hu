<?php

namespace App\Support\Booking;

use App\Models\SiteSetting;

/**
 * Details of the booking confirmation e-mail that admins maintain in the
 * "booking" site settings group: where to pay by bank transfer, and the
 * travel agency licence number required in the footer. The deadlines follow
 * the instalment rules of BookingPaymentSchedule.
 */
final class BookingConfirmationSettings
{
    public const GROUP = 'booking';

    /**
     * @var array<string, array{type: string, value: string|int}>
     */
    public const DEFAULTS = [
        'bank_account_number' => ['type' => 'string', 'value' => 'OTP 11734004-20467221'],
        'bank_account_holder' => ['type' => 'string', 'value' => 'Adria Holiday Kft'],
        'agency_license_number' => ['type' => 'string', 'value' => 'BFKH eng.szám: U-000412'],
    ];

    public function __construct(
        public readonly string $bankAccountNumber,
        public readonly string $bankAccountHolder,
        public readonly string $agencyLicenseNumber,
    ) {}

    public static function load(): self
    {
        $values = SiteSetting::valuesOf(self::GROUP, array_keys(self::DEFAULTS));
        $value = fn (string $key): mixed => $values->get($key) ?? self::DEFAULTS[$key]['value'];

        return new self(
            bankAccountNumber: trim((string) $value('bank_account_number')),
            bankAccountHolder: trim((string) $value('bank_account_holder')),
            agencyLicenseNumber: trim((string) $value('agency_license_number')),
        );
    }
}
