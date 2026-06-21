<?php

namespace App\Policies;

use App\Models\HomepageOffer;
use App\Models\User;

class HomepageOfferPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('homepage-offers.viewAny');
    }

    public function view(User $user, HomepageOffer $homepageOffer): bool
    {
        return $user->hasPermissionTo('homepage-offers.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('homepage-offers.create');
    }

    public function update(User $user, HomepageOffer $homepageOffer): bool
    {
        return $user->hasPermissionTo('homepage-offers.update');
    }

    public function delete(User $user, HomepageOffer $homepageOffer): bool
    {
        return $user->hasPermissionTo('homepage-offers.delete');
    }
}
