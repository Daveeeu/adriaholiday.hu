<?php

namespace App\Http\Requests\Admin\Location;

/**
 * The same as creating a location; its own URL name is not taken by itself.
 */
class UpdateLocationRequest extends StoreLocationRequest
{
    protected function locationId(): ?int
    {
        $location = $this->route('location');

        return is_object($location) ? (int) $location->id : (is_numeric($location) ? (int) $location : null);
    }
}
