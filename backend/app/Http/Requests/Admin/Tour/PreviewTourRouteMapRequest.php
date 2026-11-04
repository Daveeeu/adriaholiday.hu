<?php

namespace App\Http\Requests\Admin\Tour;

use App\Support\Tour\TourRouteStops;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Route map stops not saved yet, drawn for the tour editor's preview.
 */
class PreviewTourRouteMapRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge(['route_stops' => $this->input('route_stops', $this->input('routeStops', []))]);
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            ...TourRouteStops::rules('route_stops'),
            'route_stops' => ['required', 'array', 'min:1', 'max:'.TourRouteStops::MAX_STOPS],
        ];
    }
}
