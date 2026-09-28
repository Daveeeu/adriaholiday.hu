<?php

namespace App\Http\Controllers;

use App\Http\Requests\Public\StoreTourInquiryRequest;
use App\Services\Booking\TourInquiryService;

class PublicTourInquiryController extends Controller
{
    public function store(StoreTourInquiryRequest $request, TourInquiryService $inquiries)
    {
        $inquiry = $inquiries->submit($request->validated());

        return response()->json([
            'id' => $inquiry->id,
            'status' => $inquiry->status,
        ], 201);
    }
}
