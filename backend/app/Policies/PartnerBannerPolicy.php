<?php

namespace App\Policies;

use App\Models\PartnerBanner;
use App\Models\User;

class PartnerBannerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('partner-banners.viewAny');
    }

    public function view(User $user, PartnerBanner $partnerBanner): bool
    {
        return $user->hasPermissionTo('partner-banners.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('partner-banners.create');
    }

    public function update(User $user, PartnerBanner $partnerBanner): bool
    {
        return $user->hasPermissionTo('partner-banners.update');
    }

    public function delete(User $user, PartnerBanner $partnerBanner): bool
    {
        return $user->hasPermissionTo('partner-banners.delete');
    }
}
