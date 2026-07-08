<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingFormFieldResource;
use App\Models\BookingFormField;

class BookingFormFieldController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:booking-form-templates.viewAny');
    }

    public function index()
    {
        $fields = BookingFormField::query()->orderBy('sort_order')->get();

        return BookingFormFieldResource::collection($fields);
    }
}
