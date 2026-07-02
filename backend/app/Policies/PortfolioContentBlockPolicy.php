<?php

namespace App\Policies;

use App\Models\PortfolioContentBlock;
use App\Models\User;

class PortfolioContentBlockPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('portfolio-content.view');
    }

    public function view(User $user, PortfolioContentBlock $portfolioContentBlock): bool
    {
        return $user->hasPermissionTo('portfolio-content.view');
    }

    public function update(User $user, PortfolioContentBlock $portfolioContentBlock): bool
    {
        return $user->hasPermissionTo('portfolio-content.update');
    }

    public function publish(User $user, PortfolioContentBlock $portfolioContentBlock): bool
    {
        return $user->hasPermissionTo('portfolio-content.publish');
    }
}
