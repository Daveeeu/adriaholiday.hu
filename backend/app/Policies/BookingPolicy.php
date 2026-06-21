<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('bookings.viewAny');
    }

    public function view(User $user, Booking $booking): bool
    {
        return $user->hasPermissionTo('bookings.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('bookings.create');
    }

    public function update(User $user, Booking $booking): bool
    {
        return $user->hasPermissionTo('bookings.update');
    }

    public function delete(User $user, Booking $booking): bool
    {
        return $user->hasPermissionTo('bookings.delete');
    }

    public function status(User $user, Booking $booking): bool
    {
        return $user->hasPermissionTo('bookings.status');
    }
}
