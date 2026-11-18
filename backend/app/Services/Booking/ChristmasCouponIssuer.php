<?php

namespace App\Services\Booking;

use App\Models\Coupon;
use App\Support\Booking\ChristmasCoupon;
use Illuminate\Validation\ValidationException;

/**
 * Hands a visitor who opened the Christmas gift box on the website a coupon
 * of their own: single use, ChristmasCoupon::PERCENT off the base price of
 * any trip that accepts coupons, valid until the season ends.
 */
class ChristmasCouponIssuer
{
    /** @throws ValidationException outside the Christmas season */
    public function issue(): Coupon
    {
        $seasonEndsAt = ChristmasCoupon::seasonEndsAt(now());

        if ($seasonEndsAt === null) {
            throw ValidationException::withMessages([
                'season' => 'A karácsonyi kupon már nem érhető el.',
            ]);
        }

        return Coupon::query()->create([
            'active' => true,
            'name' => ChristmasCoupon::LABEL,
            'code' => Coupon::uniqueCode(ChristmasCoupon::CODE_PREFIX),
            'percent' => ChristmasCoupon::PERCENT,
            'expires_at' => $seasonEndsAt,
            'used' => false,
        ]);
    }
}
