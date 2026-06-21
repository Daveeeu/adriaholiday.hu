<?php

namespace App\Policies;

use App\Models\BlogArticle;
use App\Models\User;

class BlogArticlePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('blog-articles.viewAny');
    }

    public function view(User $user, BlogArticle $blogArticle): bool
    {
        return $user->hasPermissionTo('blog-articles.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('blog-articles.create');
    }

    public function update(User $user, BlogArticle $blogArticle): bool
    {
        return $user->hasPermissionTo('blog-articles.update');
    }

    public function delete(User $user, BlogArticle $blogArticle): bool
    {
        return $user->hasPermissionTo('blog-articles.delete');
    }
}
