<?php

namespace App\Support\Tour;

/**
 * When a tour date extra is charged: only when selected, always, or for a
 * single room supplement automatically when exactly one passenger travels;
 * in a group each passenger may select it.
 */
final class TourExtraChargeRule
{
    public const OPTIONAL = 'optional';

    public const MANDATORY = 'mandatory';

    public const SOLO_TRAVELLER = 'solo_traveller';

    /**
     * @return array<int, string>
     */
    public static function all(): array
    {
        return [self::OPTIONAL, self::MANDATORY, self::SOLO_TRAVELLER];
    }

    /**
     * Whether an extra with this rule is charged without the customer selecting it.
     */
    public static function chargedAutomatically(string $rule, int $passengers): bool
    {
        return $rule === self::MANDATORY || ($rule === self::SOLO_TRAVELLER && $passengers === 1);
    }

    /**
     * Whether the extra is chosen and charged passenger by passenger. A single
     * room supplement always belongs to one passenger, even when its price is
     * entered per booking.
     */
    public static function chargedPerPassenger(string $rule, string $priceUnit): bool
    {
        return $priceUnit === TourExtraPriceUnit::PER_PERSON || $rule === self::SOLO_TRAVELLER;
    }

    /**
     * Whether the customer may select an extra with this rule themselves.
     */
    public static function selectable(string $rule, int $passengers): bool
    {
        return $rule === self::OPTIONAL || ($rule === self::SOLO_TRAVELLER && $passengers > 1);
    }
}
