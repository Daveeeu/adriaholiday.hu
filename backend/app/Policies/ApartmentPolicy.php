<?php

namespace App\Policies;

use App\Models\Apartment;
use App\Models\User;

class ApartmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('apartments.viewAny');
    }

    public function view(User $user, Apartment $apartment): bool
    {
        return $user->hasPermissionTo('apartments.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('apartments.create');
    }

    public function update(User $user, Apartment $apartment): bool
    {
        return $user->hasPermissionTo('apartments.update');
    }

    public function delete(User $user, Apartment $apartment): bool
    {
        return $user->hasPermissionTo('apartments.delete');
    }
}
