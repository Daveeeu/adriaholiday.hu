<?php

namespace App\Policies;

use App\Models\BookingFormTemplate;
use App\Models\User;

class BookingFormTemplatePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('booking-form-templates.viewAny');
    }

    public function view(User $user, BookingFormTemplate $bookingFormTemplate): bool
    {
        return $user->hasPermissionTo('booking-form-templates.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('booking-form-templates.create');
    }

    public function update(User $user, BookingFormTemplate $bookingFormTemplate): bool
    {
        return $user->hasPermissionTo('booking-form-templates.update');
    }

    public function delete(User $user, BookingFormTemplate $bookingFormTemplate): bool
    {
        return $user->hasPermissionTo('booking-form-templates.delete');
    }
}
