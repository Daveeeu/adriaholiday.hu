<?php

namespace App\Support\Tour;

/**
 * When a tour date extra is charged: only when the customer selects it,
 * always, or automatically when exactly one passenger travels (the single
 * room supplement, which is not offered to groups).
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
     * Whether the customer may select an extra with this rule themselves.
     */
    public static function selectable(string $rule): bool
    {
        return $rule === self::OPTIONAL;
    }
}
