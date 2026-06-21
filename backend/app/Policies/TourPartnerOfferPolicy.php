<?php

namespace App\Policies;

use App\Models\TourPartnerOffer;
use App\Models\User;

class TourPartnerOfferPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('tour-partner-offers.viewAny');
    }

    public function view(User $user, TourPartnerOffer $tourPartnerOffer): bool
    {
        return $user->hasPermissionTo('tour-partner-offers.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('tour-partner-offers.create');
    }

    public function update(User $user, TourPartnerOffer $tourPartnerOffer): bool
    {
        return $user->hasPermissionTo('tour-partner-offers.update');
    }

    public function delete(User $user, TourPartnerOffer $tourPartnerOffer): bool
    {
        return $user->hasPermissionTo('tour-partner-offers.delete');
    }

    public function status(User $user, TourPartnerOffer $tourPartnerOffer): bool
    {
        return $user->hasPermissionTo('tour-partner-offers.status');
    }
}
