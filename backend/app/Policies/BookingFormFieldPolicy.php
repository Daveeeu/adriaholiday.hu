<?php

namespace App\Policies;

use App\Models\BookingFormField;
use App\Models\User;

/**
 * Booking form fields are part of booking form template configuration,
 * so they share the template permissions.
 */
class BookingFormFieldPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('booking-form-templates.viewAny');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('booking-form-templates.create');
    }

    public function update(User $user, BookingFormField $bookingFormField): bool
    {
        return $user->hasPermissionTo('booking-form-templates.update');
    }

    public function delete(User $user, BookingFormField $bookingFormField): bool
    {
        return $user->hasPermissionTo('booking-form-templates.delete');
    }
}
