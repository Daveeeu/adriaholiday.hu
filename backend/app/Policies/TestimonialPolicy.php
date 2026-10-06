<?php

namespace App\Policies;

use App\Models\Testimonial;
use App\Models\User;

class TestimonialPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('testimonials.viewAny');
    }

    public function view(User $user, Testimonial $testimonial): bool
    {
        return $user->hasPermissionTo('testimonials.view');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('testimonials.create');
    }

    public function update(User $user, Testimonial $testimonial): bool
    {
        return $user->hasPermissionTo('testimonials.update');
    }

    public function delete(User $user, Testimonial $testimonial): bool
    {
        return $user->hasPermissionTo('testimonials.delete');
    }
}
