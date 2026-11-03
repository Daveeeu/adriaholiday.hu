<?php

namespace App\Policies;

use App\Models\SeoRedirect;
use App\Models\User;

class SeoRedirectPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('seo-redirects.viewAny');
    }

    public function view(User $user, SeoRedirect $seoRedirect): bool
    {
        return $user->hasPermissionTo('seo-redirects.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('seo-redirects.create');
    }

    public function update(User $user, SeoRedirect $seoRedirect): bool
    {
        return $user->hasPermissionTo('seo-redirects.update');
    }

    public function delete(User $user, SeoRedirect $seoRedirect): bool
    {
        return $user->hasPermissionTo('seo-redirects.delete');
    }
}
