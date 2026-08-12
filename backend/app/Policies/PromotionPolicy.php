<?php

namespace App\Policies;

use App\Models\Promotion;
use App\Models\User;

class PromotionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('promotions.viewAny');
    }

    public function view(User $user, Promotion $promotion): bool
    {
        return $user->hasPermissionTo('promotions.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('promotions.create');
    }

    public function update(User $user, Promotion $promotion): bool
    {
        return $user->hasPermissionTo('promotions.update');
    }

    public function delete(User $user, Promotion $promotion): bool
    {
        return $user->hasPermissionTo('promotions.delete');
    }

    public function status(User $user, Promotion $promotion): bool
    {
        return $user->hasPermissionTo('promotions.status');
    }
}
