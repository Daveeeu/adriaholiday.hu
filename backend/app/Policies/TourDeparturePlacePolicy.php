<?php

namespace App\Policies;

use App\Models\TourDeparturePlace;
use App\Models\User;

class TourDeparturePlacePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('tour-departure-places.viewAny');
    }

    public function view(User $user, TourDeparturePlace $tourDeparturePlace): bool
    {
        return $user->hasPermissionTo('tour-departure-places.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('tour-departure-places.create');
    }

    public function update(User $user, TourDeparturePlace $tourDeparturePlace): bool
    {
        return $user->hasPermissionTo('tour-departure-places.update');
    }

    public function delete(User $user, TourDeparturePlace $tourDeparturePlace): bool
    {
        return $user->hasPermissionTo('tour-departure-places.delete');
    }

    public function status(User $user, TourDeparturePlace $tourDeparturePlace): bool
    {
        return $user->hasPermissionTo('tour-departure-places.status');
    }
}
