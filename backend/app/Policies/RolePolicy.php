<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('roles.viewAny');
    }

    public function view(User $user, Role $role): bool
    {
        return $user->hasPermissionTo('roles.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('roles.create');
    }

    public function update(User $user, Role $role): bool
    {
        return $user->hasPermissionTo('roles.update');
    }

    public function delete(User $user, Role $role): bool
    {
        return $user->hasPermissionTo('roles.delete');
    }
}
