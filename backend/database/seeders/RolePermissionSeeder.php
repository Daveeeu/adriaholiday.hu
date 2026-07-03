<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'dashboard.view',
            'analytics.view',
            'media.viewAny', 'media.view', 'media.create', 'media.update', 'media.delete',
            'site-settings.view', 'site-settings.update',
            'select-options.view',
            'tour-reference-options.create',
            'portfolio-filter-chips.viewAny', 'portfolio-filter-chips.view', 'portfolio-filter-chips.create', 'portfolio-filter-chips.update', 'portfolio-filter-chips.delete',
            'regions.viewAny', 'regions.view', 'regions.create', 'regions.update', 'regions.delete',
            'locations.viewAny', 'locations.view', 'locations.create', 'locations.update', 'locations.delete',
            'galleries.viewAny', 'galleries.view', 'galleries.create', 'galleries.update', 'galleries.delete',
            'apartments.viewAny', 'apartments.view', 'apartments.create', 'apartments.update', 'apartments.delete', 'apartments.status',
            'tours.viewAny', 'tours.view', 'tours.create', 'tours.update', 'tours.delete', 'tours.status', 'tours.reorder', 'tours.duplicate',
            'tour-region-groups.viewAny', 'tour-region-groups.view', 'tour-region-groups.create', 'tour-region-groups.update', 'tour-region-groups.delete', 'tour-region-groups.status',
            'tour-seasonal-groups.viewAny', 'tour-seasonal-groups.view', 'tour-seasonal-groups.create', 'tour-seasonal-groups.update', 'tour-seasonal-groups.delete', 'tour-seasonal-groups.status',
            'tour-departure-places.viewAny', 'tour-departure-places.view', 'tour-departure-places.create', 'tour-departure-places.update', 'tour-departure-places.delete', 'tour-departure-places.status',
            'tour-partner-offers.viewAny', 'tour-partner-offers.view', 'tour-partner-offers.create', 'tour-partner-offers.update', 'tour-partner-offers.delete', 'tour-partner-offers.status',
            'homepage-offers.viewAny', 'homepage-offers.view', 'homepage-offers.create', 'homepage-offers.update', 'homepage-offers.delete',
            'portfolio-content.view', 'portfolio-content.update', 'portfolio-content.publish',
            'blog-articles.viewAny', 'blog-articles.view', 'blog-articles.create', 'blog-articles.update', 'blog-articles.delete',
            'blog-categories.viewAny', 'blog-categories.view', 'blog-categories.create', 'blog-categories.update', 'blog-categories.delete',
            'blog-tags.viewAny', 'blog-tags.view', 'blog-tags.create', 'blog-tags.update', 'blog-tags.delete',
            'buses.viewAny', 'buses.view', 'buses.create', 'buses.update', 'buses.delete',
            'bookings.viewAny', 'bookings.view', 'bookings.create', 'bookings.update', 'bookings.delete', 'bookings.status',
            'partner-finances.viewAny', 'partner-finances.view', 'partner-finances.create', 'partner-finances.update', 'partner-finances.delete',
            'partner-banners.viewAny', 'partner-banners.view', 'partner-banners.create', 'partner-banners.update', 'partner-banners.delete',
            'messages.viewAny', 'messages.view', 'messages.create', 'messages.update', 'messages.delete', 'messages.status',
            'coupons.viewAny', 'coupons.view', 'coupons.create', 'coupons.update', 'coupons.delete', 'coupons.status',
            'email-csv-export.view',
        ];

        foreach ($permissions as $permissionName) {
            Permission::findOrCreate($permissionName, 'web');
        }

        $superAdmin = Role::findOrCreate('Super Admin', 'web');
        $admin = Role::findOrCreate('Admin', 'web');
        $contentManager = Role::findOrCreate('Content Manager', 'web');
        $partnerManager = Role::findOrCreate('Partner Manager', 'web');
        $support = Role::findOrCreate('Support', 'web');

        $superAdmin->syncPermissions($permissions);
        $admin->syncPermissions($permissions);
        $contentManager->syncPermissions([
            'dashboard.view',
            'analytics.view',
            'media.viewAny', 'media.view', 'media.create', 'media.update',
            'site-settings.view', 'site-settings.update',
            'select-options.view',
            'tour-reference-options.create',
            'portfolio-filter-chips.viewAny', 'portfolio-filter-chips.view', 'portfolio-filter-chips.create', 'portfolio-filter-chips.update', 'portfolio-filter-chips.delete',
            'regions.viewAny', 'regions.view',
            'locations.viewAny', 'locations.view',
            'galleries.viewAny', 'galleries.view',
            'apartments.viewAny', 'apartments.view',
            'tours.viewAny', 'tours.view', 'tours.create', 'tours.update', 'tours.delete', 'tours.status', 'tours.reorder', 'tours.duplicate',
            'tour-region-groups.viewAny', 'tour-region-groups.view', 'tour-region-groups.create', 'tour-region-groups.update', 'tour-region-groups.delete', 'tour-region-groups.status',
            'tour-seasonal-groups.viewAny', 'tour-seasonal-groups.view', 'tour-seasonal-groups.create', 'tour-seasonal-groups.update', 'tour-seasonal-groups.delete', 'tour-seasonal-groups.status',
            'tour-departure-places.viewAny', 'tour-departure-places.view', 'tour-departure-places.create', 'tour-departure-places.update', 'tour-departure-places.delete', 'tour-departure-places.status',
            'homepage-offers.viewAny', 'homepage-offers.view', 'homepage-offers.create', 'homepage-offers.update', 'homepage-offers.delete',
            'portfolio-content.view', 'portfolio-content.update', 'portfolio-content.publish',
            'blog-articles.viewAny', 'blog-articles.view', 'blog-articles.create', 'blog-articles.update', 'blog-articles.delete',
            'blog-categories.viewAny', 'blog-categories.view', 'blog-categories.create', 'blog-categories.update', 'blog-categories.delete',
            'blog-tags.viewAny', 'blog-tags.view', 'blog-tags.create', 'blog-tags.update', 'blog-tags.delete',
            'buses.viewAny', 'buses.view', 'buses.create', 'buses.update', 'buses.delete',
            'bookings.viewAny', 'bookings.view',
            'partner-finances.viewAny', 'partner-finances.view',
            'partner-banners.viewAny', 'partner-banners.view',
            'messages.viewAny', 'messages.view',
            'coupons.viewAny', 'coupons.view',
            'email-csv-export.view',
        ]);
        $partnerManager->syncPermissions([
            'dashboard.view',
            'analytics.view',
            'media.viewAny', 'media.view',
            'site-settings.view',
            'select-options.view',
            'apartments.viewAny', 'apartments.view',
            'tours.viewAny', 'tours.view',
            'tour-partner-offers.viewAny', 'tour-partner-offers.view', 'tour-partner-offers.create', 'tour-partner-offers.update', 'tour-partner-offers.delete', 'tour-partner-offers.status',
            'homepage-offers.viewAny', 'homepage-offers.view',
            'portfolio-content.view', 'portfolio-content.update', 'portfolio-content.publish',
            'blog-articles.viewAny', 'blog-articles.view',
            'buses.viewAny', 'buses.view',
            'bookings.viewAny', 'bookings.view',
            'partner-finances.viewAny', 'partner-finances.view', 'partner-finances.create', 'partner-finances.update', 'partner-finances.delete',
            'partner-banners.viewAny', 'partner-banners.view', 'partner-banners.create', 'partner-banners.update', 'partner-banners.delete',
            'coupons.viewAny', 'coupons.view',
            'email-csv-export.view',
        ]);
        $support->syncPermissions([
            'dashboard.view',
            'site-settings.view',
            'select-options.view',
            'regions.viewAny', 'regions.view',
            'locations.viewAny', 'locations.view',
            'galleries.viewAny', 'galleries.view',
            'apartments.viewAny', 'apartments.view',
            'tours.viewAny', 'tours.view',
            'tour-partner-offers.viewAny', 'tour-partner-offers.view',
            'bookings.viewAny', 'bookings.view',
            'messages.viewAny', 'messages.view', 'messages.status',
            'coupons.viewAny', 'coupons.view',
            'portfolio-content.view',
        ]);

        $this->seedAdminUser($superAdmin);
    }

    private function seedAdminUser(Role $superAdmin): void
    {
        [$email, $password] = $this->adminSeedCredentials();

        if ($email === null || $password === null) {
            return;
        }

        $user = User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => 'Jandl David',
                'password' => $password,
            ],
        );

        $user->assignRole($superAdmin);
    }

    /**
     * @return array{0: string|null, 1: string|null}
     */
    private function adminSeedCredentials(): array
    {
        $email = env('ADMIN_SEED_EMAIL');
        $password = env('ADMIN_SEED_PASSWORD');

        if (is_string($email) && $email !== '' && is_string($password) && $password !== '') {
            return [$email, $password];
        }

        if (app()->environment(['local', 'development', 'testing'])) {
            return ['info@jandldavid.hu', 'password'];
        }

        return [null, null];
    }
}
