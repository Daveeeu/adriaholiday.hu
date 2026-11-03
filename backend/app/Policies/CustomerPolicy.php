<?php

namespace App\Policies;

use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('customers.viewAny');
    }

    public function view(User $user, Customer $customer): bool
    {
        return $user->hasPermissionTo('customers.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('customers.create');
    }

    public function update(User $user, Customer $customer): bool
    {
        return $user->hasPermissionTo('customers.update');
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $user->hasPermissionTo('customers.delete');
    }
}
