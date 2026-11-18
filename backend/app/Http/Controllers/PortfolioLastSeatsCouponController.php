<?php

namespace App\Http\Controllers;

use App\Models\Tour;
use App\Models\TourDate;
use App\Services\Booking\LastSeatsCouponIssuer;
use Illuminate\Http\JsonResponse;

/** The one-day last seats coupon a trip page offers a visitor reading about a date running low on seats. */
class PortfolioLastSeatsCouponController extends Controller
{
    public function __invoke(string $slug, int $tourDate, LastSeatsCouponIssuer $issuer): JsonResponse
    {
        $tour = Tour::query()->where('active', true)->where('seo_name', $slug)->firstOrFail();
        $date = TourDate::query()->whereBelongsTo($tour)->upcoming()->withSeatsHeld()->findOrFail($tourDate);

        $coupon = $issuer->issue($tour, $date);

        return response()->json([
            'code' => $coupon->code,
            'percent' => (float) $coupon->percent,
            'expiresAt' => $coupon->expires_at->toIso8601String(),
        ], 201);
    }
}
