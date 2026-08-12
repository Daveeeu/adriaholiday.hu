<?php

namespace App\Policies;

use App\Models\ApartmentType;
use App\Models\User;

class ApartmentTypePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('apartment-types.viewAny');
    }

    public function view(User $user, ApartmentType $apartmentType): bool
    {
        return $user->hasPermissionTo('apartment-types.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('apartment-types.create');
    }

    public function update(User $user, ApartmentType $apartmentType): bool
    {
        return $user->hasPermissionTo('apartment-types.update');
    }

    public function delete(User $user, ApartmentType $apartmentType): bool
    {
        return $user->hasPermissionTo('apartment-types.delete');
    }

    public function status(User $user, ApartmentType $apartmentType): bool
    {
        return $user->hasPermissionTo('apartment-types.status');
    }
}
