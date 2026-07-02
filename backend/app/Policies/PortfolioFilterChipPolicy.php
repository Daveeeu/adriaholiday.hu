<?php

namespace App\Policies;

use App\Models\PortfolioFilterChip;
use App\Models\User;

class PortfolioFilterChipPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('portfolio-filter-chips.viewAny');
    }

    public function view(User $user, PortfolioFilterChip $portfolioFilterChip): bool
    {
        return $user->hasPermissionTo('portfolio-filter-chips.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('portfolio-filter-chips.create');
    }

    public function update(User $user, PortfolioFilterChip $portfolioFilterChip): bool
    {
        return $user->hasPermissionTo('portfolio-filter-chips.update');
    }

    public function delete(User $user, PortfolioFilterChip $portfolioFilterChip): bool
    {
        return $user->hasPermissionTo('portfolio-filter-chips.delete');
    }
}
