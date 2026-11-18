<?php

namespace App\Services\Booking;

use App\Models\Coupon;
use App\Models\Tour;
use App\Models\TourDate;
use App\Support\Booking\LastSeatsDiscount;
use Illuminate\Validation\ValidationException;

/**
 * Hands a visitor of a trip page a coupon for the last seats discount of the
 * date they are looking at: single use, for that date only, valid for
 * LastSeatsDiscount::VALID_HOURS.
 */
class LastSeatsCouponIssuer
{
    /** @throws ValidationException when the date offers no last seats discount */
    public function issue(Tour $tour, TourDate $tourDate): Coupon
    {
        $percent = LastSeatsDiscount::percentFor($tour, $tourDate);

        if ($percent === null) {
            throw ValidationException::withMessages([
                'tourDate' => 'Erre az időpontra most nem jár kupon.',
            ]);
        }

        return Coupon::query()->create([
            'active' => true,
            'name' => LastSeatsDiscount::LABEL.' – '.$tour->name.' ('.$tourDate->start_date?->toDateString().')',
            'code' => Coupon::uniqueCode('LAST'),
            'percent' => $percent,
            'tour_date_id' => $tourDate->id,
            'expires_at' => now()->addHours(LastSeatsDiscount::VALID_HOURS),
            'used' => false,
        ]);
    }
}
