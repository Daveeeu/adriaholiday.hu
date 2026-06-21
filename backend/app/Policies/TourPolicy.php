<?php

namespace App\Policies;

use App\Models\Tour;
use App\Models\User;

class TourPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('tours.viewAny');
    }

    public function view(User $user, Tour $tour): bool
    {
        return $user->hasPermissionTo('tours.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('tours.create');
    }

    public function update(User $user, Tour $tour): bool
    {
        return $user->hasPermissionTo('tours.update');
    }

    public function delete(User $user, Tour $tour): bool
    {
        return $user->hasPermissionTo('tours.delete');
    }

    public function status(User $user, Tour $tour): bool
    {
        return $user->hasPermissionTo('tours.status');
    }

    public function reorder(User $user): bool
    {
        return $user->hasPermissionTo('tours.reorder');
    }

    public function duplicate(User $user, Tour $tour): bool
    {
        return $user->hasPermissionTo('tours.duplicate');
    }

    public function move(User $user, Tour $tour): bool
    {
        return $user->hasPermissionTo('tours.reorder');
    }
}
