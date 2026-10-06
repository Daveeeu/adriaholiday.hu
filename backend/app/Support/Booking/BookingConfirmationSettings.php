<?php

namespace App\Support\Booking;

use App\Models\SiteSetting;
use Carbon\CarbonInterface;

/**
 * Details of the booking confirmation e-mail that admins maintain in the
 * "booking" site settings group: where and until when to pay by bank
 * transfer, and the travel agency licence number required in the footer.
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
        'payment_due_days' => ['type' => 'number', 'value' => 3],
        'agency_license_number' => ['type' => 'string', 'value' => 'BFKH eng.szám: U-000412'],
    ];

    public function __construct(
        public readonly string $bankAccountNumber,
        public readonly string $bankAccountHolder,
        public readonly int $paymentDueDays,
        public readonly string $agencyLicenseNumber,
    ) {}

    public static function load(): self
    {
        $values = SiteSetting::valuesOf(self::GROUP, array_keys(self::DEFAULTS));
        $value = fn (string $key): mixed => $values->get($key) ?? self::DEFAULTS[$key]['value'];

        return new self(
            bankAccountNumber: trim((string) $value('bank_account_number')),
            bankAccountHolder: trim((string) $value('bank_account_holder')),
            paymentDueDays: max(0, (int) $value('payment_due_days')),
            agencyLicenseNumber: trim((string) $value('agency_license_number')),
        );
    }

    /**
     * The bank transfer deadline of a booking made at the given time; never after departure.
     */
    public function paymentDueDate(CarbonInterface $bookedAt, ?CarbonInterface $departure): CarbonInterface
    {
        $due = $bookedAt->copy()->startOfDay()->addDays($this->paymentDueDays);

        return $departure !== null && $departure->lessThan($due) ? $departure->copy()->startOfDay() : $due;
    }
}
