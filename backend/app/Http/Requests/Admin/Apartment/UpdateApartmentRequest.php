<?php

namespace App\Http\Requests\Admin\Apartment;

/**
 * The same as creating an apartment; its own URL name is not taken by itself.
 */
class UpdateApartmentRequest extends StoreApartmentRequest
{
    protected function apartmentId(): ?int
    {
        $apartment = $this->route('apartment');

        return is_object($apartment) ? (int) $apartment->id : (is_numeric($apartment) ? (int) $apartment : null);
    }
}
