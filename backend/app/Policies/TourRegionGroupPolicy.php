<?php

namespace App\Policies;

use App\Models\TourRegionGroup;
use App\Models\User;

class TourRegionGroupPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('tour-region-groups.viewAny');
    }

    public function view(User $user, TourRegionGroup $tourRegionGroup): bool
    {
        return $user->hasPermissionTo('tour-region-groups.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('tour-region-groups.create');
    }

    public function update(User $user, TourRegionGroup $tourRegionGroup): bool
    {
        return $user->hasPermissionTo('tour-region-groups.update');
    }

    public function delete(User $user, TourRegionGroup $tourRegionGroup): bool
    {
        return $user->hasPermissionTo('tour-region-groups.delete');
    }

    public function status(User $user, TourRegionGroup $tourRegionGroup): bool
    {
        return $user->hasPermissionTo('tour-region-groups.status');
    }
}
