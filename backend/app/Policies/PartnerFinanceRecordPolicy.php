<?php

namespace App\Policies;

use App\Models\PartnerFinanceRecord;
use App\Models\User;

class PartnerFinanceRecordPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('partner-finances.viewAny');
    }

    public function view(User $user, PartnerFinanceRecord $partnerFinanceRecord): bool
    {
        return $user->hasPermissionTo('partner-finances.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('partner-finances.create');
    }

    public function update(User $user, PartnerFinanceRecord $partnerFinanceRecord): bool
    {
        return $user->hasPermissionTo('partner-finances.update');
    }

    public function delete(User $user, PartnerFinanceRecord $partnerFinanceRecord): bool
    {
        return $user->hasPermissionTo('partner-finances.delete');
    }
}
