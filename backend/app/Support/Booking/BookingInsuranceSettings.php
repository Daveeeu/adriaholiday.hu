<?php

namespace App\Support\Booking;

use App\Models\SiteSetting;

/**
 * The travel and cancellation insurances offered on every tour booking,
 * configured by admins in the "booking" site settings group.
 *
 * Travel insurance costs a fixed amount per passenger per travel day;
 * cancellation insurance a percentage of the trip total and is only sold
 * while the departure is at least the configured number of days away. Each
 * has a short description the booking form shows behind its ⓘ.
 */
final class BookingInsuranceSettings
{
    public const GROUP = 'booking';

    /**
     * Seed values, mirroring the legacy site's ALFA Compass offer.
     *
     * @var array<string, array{type: string, value: string|int|float}>
     */
    public const DEFAULTS = [
        'travel_insurance_name' => ['type' => 'string', 'value' => 'ALFA Compass utasbiztosítás'],
        'travel_insurance_daily_fee' => ['type' => 'number', 'value' => 540],
        'cancellation_insurance_name' => ['type' => 'string', 'value' => 'ALFA Compass útlemondási biztosítás'],
        'cancellation_insurance_percent' => ['type' => 'number', 'value' => 2.8],
        'cancellation_insurance_min_days' => ['type' => 'number', 'value' => 7],
        'travel_insurance_info' => ['type' => 'text', 'value' => self::TRAVEL_INSURANCE_INFO],
        'cancellation_insurance_info' => ['type' => 'text', 'value' => self::CANCELLATION_INSURANCE_INFO],
    ];

    /** Summarised from the insurer's product information on the "Biztosítások" page. */
    private const TRAVEL_INSURANCE_INFO = 'Betegség-, baleset- és poggyászbiztosítás Európa területére, az utazás minden napjára. '
        .'Fedezi többek között a sürgősségi orvosi ellátást, a betegszállítást és a hazaszállítást, a poggyászkárt és a poggyászkésést, '
        .'és 0–24 órás magyar nyelvű telefonos segítségnyújtást ad. A díja utasonként és naponként számolódik.';

    private const CANCELLATION_INSURANCE_INFO = 'Ha az utazás előtt hirtelen fellépő betegség, baleset vagy a feltételekben felsorolt más ok '
        .'(például közeli hozzátartozó súlyos betegsége) miatt nem tudsz elutazni, megtéríti a már befizetett költségeket.';

    public function __construct(
        public readonly string $travelInsuranceName,
        public readonly float $travelInsuranceDailyFee,
        public readonly string $cancellationInsuranceName,
        public readonly float $cancellationInsurancePercent,
        public readonly int $cancellationInsuranceMinDays,
        public readonly string $travelInsuranceInfo,
        public readonly string $cancellationInsuranceInfo,
    ) {}

    public static function load(): self
    {
        $values = SiteSetting::valuesOf(self::GROUP, array_keys(self::DEFAULTS));

        $value = fn (string $key): mixed => $values->get($key) ?? self::DEFAULTS[$key]['value'];

        return new self(
            travelInsuranceName: (string) $value('travel_insurance_name'),
            travelInsuranceDailyFee: max(0.0, (float) $value('travel_insurance_daily_fee')),
            cancellationInsuranceName: (string) $value('cancellation_insurance_name'),
            cancellationInsurancePercent: max(0.0, (float) $value('cancellation_insurance_percent')),
            cancellationInsuranceMinDays: max(0, (int) $value('cancellation_insurance_min_days')),
            travelInsuranceInfo: trim((string) $value('travel_insurance_info')),
            cancellationInsuranceInfo: trim((string) $value('cancellation_insurance_info')),
        );
    }

    /**
     * @return array{travelInsurance: array{name: string, dailyFee: float, info: ?string}, cancellationInsurance: array{name: string, percent: float, minDaysBeforeDeparture: int, info: ?string}}
     */
    public function toArray(): array
    {
        return [
            'travelInsurance' => [
                'name' => $this->travelInsuranceName,
                'dailyFee' => $this->travelInsuranceDailyFee,
                'info' => $this->travelInsuranceInfo !== '' ? $this->travelInsuranceInfo : null,
            ],
            'cancellationInsurance' => [
                'name' => $this->cancellationInsuranceName,
                'percent' => $this->cancellationInsurancePercent,
                'minDaysBeforeDeparture' => $this->cancellationInsuranceMinDays,
                'info' => $this->cancellationInsuranceInfo !== '' ? $this->cancellationInsuranceInfo : null,
            ],
        ];
    }
}
