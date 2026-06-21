<?php

namespace App\Policies;

use App\Models\Coupon;
use App\Models\User;

class CouponPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('coupons.viewAny');
    }

    public function view(User $user, Coupon $coupon): bool
    {
        return $user->hasPermissionTo('coupons.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('coupons.create');
    }

    public function update(User $user, Coupon $coupon): bool
    {
        return $user->hasPermissionTo('coupons.update');
    }

    public function delete(User $user, Coupon $coupon): bool
    {
        return $user->hasPermissionTo('coupons.delete');
    }

    public function status(User $user, Coupon $coupon): bool
    {
        return $user->hasPermissionTo('coupons.status');
    }
}
