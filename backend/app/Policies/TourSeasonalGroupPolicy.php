<?php

namespace App\Policies;

use App\Models\TourSeasonalGroup;
use App\Models\User;

class TourSeasonalGroupPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('tour-seasonal-groups.viewAny');
    }

    public function view(User $user, TourSeasonalGroup $tourSeasonalGroup): bool
    {
        return $user->hasPermissionTo('tour-seasonal-groups.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('tour-seasonal-groups.create');
    }

    public function update(User $user, TourSeasonalGroup $tourSeasonalGroup): bool
    {
        return $user->hasPermissionTo('tour-seasonal-groups.update');
    }

    public function delete(User $user, TourSeasonalGroup $tourSeasonalGroup): bool
    {
        return $user->hasPermissionTo('tour-seasonal-groups.delete');
    }

    public function status(User $user, TourSeasonalGroup $tourSeasonalGroup): bool
    {
        return $user->hasPermissionTo('tour-seasonal-groups.status');
    }
}
