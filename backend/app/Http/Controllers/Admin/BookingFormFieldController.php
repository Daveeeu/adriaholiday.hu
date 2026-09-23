<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BookingFormField\StoreBookingFormFieldRequest;
use App\Http\Requests\Admin\BookingFormField\UpdateBookingFormFieldRequest;
use App\Http\Resources\BookingFormFieldResource;
use App\Models\BookingFormField;
use App\Services\Booking\BookingFormFieldService;

class BookingFormFieldController extends Controller
{
    public function __construct(private readonly BookingFormFieldService $fieldService)
    {
        $this->authorizeResource(BookingFormField::class, 'bookingFormField');
    }

    public function index()
    {
        $fields = BookingFormField::query()->orderBy('sort_order')->orderBy('id')->get();

        return BookingFormFieldResource::collection($fields);
    }

    public function store(StoreBookingFormFieldRequest $request)
    {
        return new BookingFormFieldResource($this->fieldService->create($request->validated()));
    }

    public function update(UpdateBookingFormFieldRequest $request, BookingFormField $bookingFormField)
    {
        return new BookingFormFieldResource($this->fieldService->update($bookingFormField, $request->validated()));
    }

    public function destroy(BookingFormField $bookingFormField)
    {
        $this->fieldService->delete($bookingFormField);

        return response()->noContent();
    }
}
