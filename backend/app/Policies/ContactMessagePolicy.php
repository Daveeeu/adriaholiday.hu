<?php

namespace App\Policies;

use App\Models\ContactMessage;
use App\Models\User;

class ContactMessagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('messages.viewAny');
    }

    public function view(User $user, ContactMessage $contactMessage): bool
    {
        return $user->hasPermissionTo('messages.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('messages.create');
    }

    public function update(User $user, ContactMessage $contactMessage): bool
    {
        return $user->hasPermissionTo('messages.update');
    }

    public function delete(User $user, ContactMessage $contactMessage): bool
    {
        return $user->hasPermissionTo('messages.delete');
    }

    public function status(User $user, ContactMessage $contactMessage): bool
    {
        return $user->hasPermissionTo('messages.status');
    }
}
