<?php

namespace App\Policies;

use App\Models\Location;
use App\Models\User;

class LocationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('locations.viewAny');
    }

    public function view(User $user, Location $location): bool
    {
        return $user->hasPermissionTo('locations.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('locations.create');
    }

    public function update(User $user, Location $location): bool
    {
        return $user->hasPermissionTo('locations.update');
    }

    public function delete(User $user, Location $location): bool
    {
        return $user->hasPermissionTo('locations.delete');
    }
}
