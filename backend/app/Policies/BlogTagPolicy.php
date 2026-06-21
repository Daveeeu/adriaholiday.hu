<?php

namespace App\Policies;

use App\Models\BlogTag;
use App\Models\User;

class BlogTagPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('blog-tags.viewAny');
    }

    public function view(User $user, BlogTag $blogTag): bool
    {
        return $user->hasPermissionTo('blog-tags.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('blog-tags.create');
    }

    public function update(User $user, BlogTag $blogTag): bool
    {
        return $user->hasPermissionTo('blog-tags.update');
    }

    public function delete(User $user, BlogTag $blogTag): bool
    {
        return $user->hasPermissionTo('blog-tags.delete');
    }
}
