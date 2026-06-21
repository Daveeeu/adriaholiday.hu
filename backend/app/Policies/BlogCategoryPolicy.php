<?php

namespace App\Policies;

use App\Models\BlogCategory;
use App\Models\User;

class BlogCategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('blog-categories.viewAny');
    }

    public function view(User $user, BlogCategory $blogCategory): bool
    {
        return $user->hasPermissionTo('blog-categories.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('blog-categories.create');
    }

    public function update(User $user, BlogCategory $blogCategory): bool
    {
        return $user->hasPermissionTo('blog-categories.update');
    }

    public function delete(User $user, BlogCategory $blogCategory): bool
    {
        return $user->hasPermissionTo('blog-categories.delete');
    }
}
