<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Http\Resources\ContactMessageResource;
use App\Http\Resources\CouponResource;
use App\Models\Booking;
use App\Models\ContactMessage;
use App\Models\Coupon;
use Illuminate\Http\Request;

class EmailCsvExportController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:email-csv-export.view');
    }

    public function index(Request $request)
    {
        $source = (string) $request->query('source', '');
        $format = (string) $request->query('format', 'csv');

        if ($format !== 'csv') {
            abort(422, 'Unsupported format.');
        }

        $items = match ($source) {
            'tour_bookings' => BookingResource::collection(Booking::query()->where('booking_type', 'tour_booking')->orderByDesc('created_at')->get())->resolve(),
            'tour_inquiries' => BookingResource::collection(Booking::query()->where('booking_type', 'tour_inquiry')->orderByDesc('created_at')->get())->resolve(),
            'apartment_bookings' => BookingResource::collection(Booking::query()->where('booking_type', 'apartment_booking')->orderByDesc('created_at')->get())->resolve(),
            'messages' => ContactMessageResource::collection(ContactMessage::query()->orderByDesc('created_at')->get())->resolve(),
            'coupons' => CouponResource::collection(Coupon::query()->orderByDesc('created_at')->get())->resolve(),
            default => abort(422, 'Unsupported source.'),
        };

        return response()->json([
            'source' => $source,
            'format' => $format,
            'items' => $items,
            'totalCount' => count($items),
        ]);
    }
}
