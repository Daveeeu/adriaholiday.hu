<?php

namespace App\Support\Legacy;

use App\Services\Legacy\LegacyBookingOptionsParser;
use App\Support\Tour\TourExtraChargeRule;
use App\Support\Tour\TourExtraCurrency;
use App\Support\Tour\TourExtraPriceUnit;
use Illuminate\Support\Str;

/**
 * How the legacy admin's booking options read on the new site: date prices
 * with their sale price, extras ("felár") with their type and unit, the
 * resort fee, departure place labels and travel modes. Shared by every
 * reader of legacy admin data so they all map them the same way.
 */
final class LegacyBookingOptionRules
{
    private const TRAVEL_MODES = ['Autóbusszal' => 'bus', 'Repülővel' => 'plane', 'Vonattal' => 'train'];

    /**
     * The price a date sells at and, when on sale, the original price shown crossed out.
     *
     * @return array{price: float|null, original_price: float|null}
     */
    public static function datePrice(?float $price, ?float $salePrice): array
    {
        $onSale = $salePrice !== null && $salePrice > 0 && $price !== null && $salePrice < $price;

        return [
            'price' => $onSale ? $salePrice : $price,
            'original_price' => $onSale ? $price : null,
        ];
    }

    /**
     * A last minute discount percent as its badge, "-10%".
     */
    public static function discountBadge(?float $percent): ?string
    {
        return $percent !== null && $percent > 0 ? '-'.rtrim(rtrim(number_format($percent, 2, ',', ''), '0'), ',').'%' : null;
    }

    /**
     * The legacy extra types: "Egyágyas" is the single room supplement,
     * "Előre kiválasztott…" is always charged (e.g. the flight ticket), any
     * other the customer may choose.
     */
    public static function chargeRule(string $type): string
    {
        return match (true) {
            trim($type) === 'Egyágyas' => TourExtraChargeRule::SOLO_TRAVELLER,
            Str::startsWith(trim($type), 'Előre kiválasztott') => TourExtraChargeRule::MANDATORY,
            default => TourExtraChargeRule::OPTIONAL,
        };
    }

    /**
     * "Ft" or "EUR" is charged once per booking, anything else ("Ft/fő", "EUR/fő") per passenger.
     */
    public static function priceUnit(string $unit): string
    {
        return in_array(trim($unit), ['Ft', TourExtraCurrency::EUR], true) ? TourExtraPriceUnit::PER_BOOKING : TourExtraPriceUnit::PER_PERSON;
    }

    /**
     * An extra priced in euros is paid on site, never with the forint total.
     */
    public static function currency(string $unit): string
    {
        return Str::startsWith(trim($unit), TourExtraCurrency::EUR) ? TourExtraCurrency::EUR : TourExtraCurrency::HUF;
    }

    /**
     * The resort fee charged per passenger with every booking of the date.
     *
     * @return array{name: string, price: float, currency: string, price_unit: string, charge_rule: string}
     */
    public static function resortFee(float $fee, string $currency = TourExtraCurrency::HUF): array
    {
        return [
            'name' => LegacyBookingOptionsParser::RESORT_FEE_NAME,
            'price' => $fee,
            'currency' => $currency,
            'price_unit' => TourExtraPriceUnit::PER_PERSON,
            'charge_rule' => TourExtraChargeRule::MANDATORY,
        ];
    }

    public static function isResortFee(string $name): bool
    {
        return mb_strtolower(trim($name)) === mb_strtolower(LegacyBookingOptionsParser::RESORT_FEE_NAME);
    }

    /**
     * A departure place label, "Miskolc, Centrum Áruház mögötti parkoló(+0 Ft/fő)".
     *
     * @return array{name: string, fee: float}|null
     */
    public static function departurePlace(string $label): ?array
    {
        preg_match('/^(.*?)\s*\(\+\s*([\d\s.]+)\s*Ft\/fő\)\s*$/u', trim($label), $match);
        $name = trim($match[1] ?? $label);

        return $name !== '' ? ['name' => $name, 'fee' => (float) preg_replace('/\D/', '', $match[2] ?? '0')] : null;
    }

    /**
     * "Autóbusszal" → bus, "Repülővel" → plane, "Vonattal" → train; anything else (e.g. "Válassz") is none.
     */
    public static function travelMode(?string $label): ?string
    {
        return self::TRAVEL_MODES[trim((string) $label)] ?? null;
    }
}
