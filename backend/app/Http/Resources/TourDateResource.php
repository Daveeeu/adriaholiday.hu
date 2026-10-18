<?php

namespace App\Http\Resources;

use App\Support\Booking\BookingPaymentSchedule;
use App\Support\PriceBoxData;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourDateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $priceBox = PriceBoxData::fromDate($this->resource);

        return [
            'id' => $this->id,
            'tourId' => $this->tour_id,
            'startDate' => $this->start_date?->toDateString(),
            'endDate' => $this->end_date?->toDateString(),
            'price' => $this->price !== null ? (float) $this->price : null,
            'displayedPrice' => $priceBox['displayedPrice'] ?? null,
            'priceBox' => $priceBox,
            'status' => $this->status,
            'departurePlaceIds' => array_map('intval', $this->departure_place_ids ?? []),
            // The date's own stay; null: the tour's.
            'accommodation' => $this->accommodation,
            'accommodationInfo' => $this->accommodation_info,
            'catering' => $this->catering,
            'cateringInfo' => $this->catering_info,
            // Admin only (the public offer leaves them out): whether the partner feeds list the date, its Cesys stay.
            'xmlEnabled' => (bool) ($this->xml_enabled ?? true),
            'partnerXml' => [
                'cesysAccommodation' => $this->partner_xml['cesys_accommodation'] ?? null,
                'cesysRoom' => $this->partner_xml['cesys_room'] ?? null,
            ],
            // The trip price share paid as deposit (online, right after booking) if booked today.
            'depositPercent' => $this->start_date !== null ? BookingPaymentSchedule::depositPercent($this->start_date) : null,
            // A booking whose trip price is below this is paid in full instead.
            'instalmentsMinTripTotal' => BookingPaymentSchedule::INSTALMENTS_MIN_TRIP_TOTAL,
            'extras' => TourDateExtraResource::collection($this->relationLoaded('extras') ? $this->extras : collect())->resolve($request),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
