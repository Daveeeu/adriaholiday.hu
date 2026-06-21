<?php

namespace App\Policies;

use App\Models\Bus;
use App\Models\User;

class BusPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('buses.viewAny');
    }

    public function view(User $user, Bus $bus): bool
    {
        return $user->hasPermissionTo('buses.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('buses.create');
    }

    public function update(User $user, Bus $bus): bool
    {
        return $user->hasPermissionTo('buses.update');
    }

    public function delete(User $user, Bus $bus): bool
    {
        return $user->hasPermissionTo('buses.delete');
    }
}
