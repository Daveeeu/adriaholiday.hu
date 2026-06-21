<?php

namespace App\Policies;

use App\Models\Region;
use App\Models\User;

class RegionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('regions.viewAny');
    }

    public function view(User $user, Region $region): bool
    {
        return $user->hasPermissionTo('regions.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('regions.create');
    }

    public function update(User $user, Region $region): bool
    {
        return $user->hasPermissionTo('regions.update');
    }

    public function delete(User $user, Region $region): bool
    {
        return $user->hasPermissionTo('regions.delete');
    }
}
