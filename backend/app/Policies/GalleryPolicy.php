<?php

namespace App\Policies;

use App\Models\Gallery;
use App\Models\User;

class GalleryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('galleries.viewAny');
    }

    public function view(User $user, Gallery $gallery): bool
    {
        return $user->hasPermissionTo('galleries.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('galleries.create');
    }

    public function update(User $user, Gallery $gallery): bool
    {
        return $user->hasPermissionTo('galleries.update');
    }

    public function delete(User $user, Gallery $gallery): bool
    {
        return $user->hasPermissionTo('galleries.delete');
    }
}
