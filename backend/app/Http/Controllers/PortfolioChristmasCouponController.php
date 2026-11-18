<?php

namespace App\Http\Controllers;

use App\Services\Booking\ChristmasCouponIssuer;
use Illuminate\Http\JsonResponse;

/** The coupon the website's Christmas gift box gives a visitor (see ChristmasCouponIssuer). */
class PortfolioChristmasCouponController extends Controller
{
    public function __invoke(ChristmasCouponIssuer $issuer): JsonResponse
    {
        $coupon = $issuer->issue();

        return response()->json([
            'code' => $coupon->code,
            'percent' => (float) $coupon->percent,
            'expiresAt' => $coupon->expires_at->toIso8601String(),
        ], 201);
    }
}
