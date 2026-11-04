<?php

namespace App\Http\Requests\Admin\Tour;

/**
 * The same as creating a departure place; its own name is not taken by itself.
 */
class UpdateTourDeparturePlaceRequest extends StoreTourDeparturePlaceRequest
{
    protected function placeId(): ?int
    {
        $place = $this->route('tourDeparturePlace');

        return is_object($place) ? (int) $place->id : (is_numeric($place) ? (int) $place : null);
    }
}
