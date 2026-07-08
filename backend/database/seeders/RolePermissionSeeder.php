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
        $permissionGroups = $this->permissionGroups();
        $allPermissions = collect($permissionGroups)->flatten()->values()->all();

        foreach ($allPermissions as $permissionName) {
            Permission::findOrCreate($permissionName, 'web');
        }

        $viewOnlyPermissions = collect($allPermissions)
            ->filter(fn (string $permission): bool => str_ends_with($permission, '.viewAny') || str_ends_with($permission, '.view'))
            ->reject(fn (string $permission): bool => str_starts_with($permission, 'users.') || str_starts_with($permission, 'roles.') || str_starts_with($permission, 'permissions.'))
            ->values()
            ->all();

        $superAdmin = Role::findOrCreate('Super Admin', 'web');
        $admin = Role::findOrCreate('Admin', 'web');
        $marketing = Role::findOrCreate('Marketing', 'web');
        $contentEditor = Role::findOrCreate('Content Editor', 'web');
        $sales = Role::findOrCreate('Sales', 'web');
        $operator = Role::findOrCreate('Operator', 'web');
        $viewer = Role::findOrCreate('Viewer', 'web');

        $superAdmin->syncPermissions($allPermissions);

        $adminPermissions = collect($allPermissions)
            ->reject(fn (string $permission): bool => str_starts_with($permission, 'roles.') || str_starts_with($permission, 'permissions.'))
            ->values()
            ->all();
        $admin->syncPermissions($adminPermissions);

        $marketing->syncPermissions([
            ...$permissionGroups['dashboard'],
            ...$permissionGroups['analytics'],
            ...$permissionGroups['blogArticles'],
            ...$permissionGroups['blogCategories'],
            ...$permissionGroups['blogTags'],
            ...$permissionGroups['homepageOffers'],
            ...$permissionGroups['portfolioContent'],
            ...$permissionGroups['media'],
        ]);

        $contentEditor->syncPermissions([
            ...$permissionGroups['dashboard'],
            ...$permissionGroups['blogArticles'],
            ...$permissionGroups['blogCategories'],
            ...$permissionGroups['blogTags'],
            ...$permissionGroups['tours'],
            ...$permissionGroups['tourRegionGroups'],
            ...$permissionGroups['tourSeasonalGroups'],
            ...$permissionGroups['tourDeparturePlaces'],
            ...$permissionGroups['media'],
            ...$permissionGroups['bookingFormTemplates'],
            'portfolio-content.view', 'portfolio-content.update',
        ]);

        $sales->syncPermissions([
            ...$permissionGroups['dashboard'],
            ...$permissionGroups['analytics'],
            'tours.viewAny', 'tours.view',
            ...$permissionGroups['bookings'],
            ...$permissionGroups['messages'],
            'coupons.viewAny', 'coupons.view',
            'partner-finances.viewAny', 'partner-finances.view',
            'email-csv-export.view',
        ]);

        $operator->syncPermissions([
            ...$permissionGroups['dashboard'],
            ...$permissionGroups['tours'],
            ...$permissionGroups['bookings'],
            ...$permissionGroups['media'],
        ]);

        $viewer->syncPermissions($viewOnlyPermissions);

        $this->seedAdminUser($superAdmin);
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function permissionGroups(): array
    {
        return [
            'dashboard' => ['dashboard.view'],
            'analytics' => ['analytics.view'],
            'media' => ['media.viewAny', 'media.view', 'media.create', 'media.update', 'media.delete'],
            'siteSettings' => ['site-settings.view', 'site-settings.update'],
            'selectOptions' => ['select-options.view'],
            'tourReferenceOptions' => ['tour-reference-options.create'],
            'portfolioFilterChips' => ['portfolio-filter-chips.viewAny', 'portfolio-filter-chips.view', 'portfolio-filter-chips.create', 'portfolio-filter-chips.update', 'portfolio-filter-chips.delete'],
            'regions' => ['regions.viewAny', 'regions.view', 'regions.create', 'regions.update', 'regions.delete'],
            'locations' => ['locations.viewAny', 'locations.view', 'locations.create', 'locations.update', 'locations.delete'],
            'galleries' => ['galleries.viewAny', 'galleries.view', 'galleries.create', 'galleries.update', 'galleries.delete'],
            'apartments' => ['apartments.viewAny', 'apartments.view', 'apartments.create', 'apartments.update', 'apartments.delete', 'apartments.status'],
            'tours' => ['tours.viewAny', 'tours.view', 'tours.create', 'tours.update', 'tours.delete', 'tours.status', 'tours.reorder', 'tours.duplicate'],
            'tourRegionGroups' => ['tour-region-groups.viewAny', 'tour-region-groups.view', 'tour-region-groups.create', 'tour-region-groups.update', 'tour-region-groups.delete', 'tour-region-groups.status'],
            'tourSeasonalGroups' => ['tour-seasonal-groups.viewAny', 'tour-seasonal-groups.view', 'tour-seasonal-groups.create', 'tour-seasonal-groups.update', 'tour-seasonal-groups.delete', 'tour-seasonal-groups.status'],
            'tourDeparturePlaces' => ['tour-departure-places.viewAny', 'tour-departure-places.view', 'tour-departure-places.create', 'tour-departure-places.update', 'tour-departure-places.delete', 'tour-departure-places.status'],
            'tourPartnerOffers' => ['tour-partner-offers.viewAny', 'tour-partner-offers.view', 'tour-partner-offers.create', 'tour-partner-offers.update', 'tour-partner-offers.delete', 'tour-partner-offers.status'],
            'homepageOffers' => ['homepage-offers.viewAny', 'homepage-offers.view', 'homepage-offers.create', 'homepage-offers.update', 'homepage-offers.delete'],
            'portfolioContent' => ['portfolio-content.view', 'portfolio-content.update', 'portfolio-content.publish'],
            'blogArticles' => ['blog-articles.viewAny', 'blog-articles.view', 'blog-articles.create', 'blog-articles.update', 'blog-articles.delete'],
            'blogCategories' => ['blog-categories.viewAny', 'blog-categories.view', 'blog-categories.create', 'blog-categories.update', 'blog-categories.delete'],
            'blogTags' => ['blog-tags.viewAny', 'blog-tags.view', 'blog-tags.create', 'blog-tags.update', 'blog-tags.delete'],
            'buses' => ['buses.viewAny', 'buses.view', 'buses.create', 'buses.update', 'buses.delete'],
            'bookingFormTemplates' => ['booking-form-templates.viewAny', 'booking-form-templates.view', 'booking-form-templates.create', 'booking-form-templates.update', 'booking-form-templates.delete'],
            'bookings' => ['bookings.viewAny', 'bookings.view', 'bookings.create', 'bookings.update', 'bookings.delete', 'bookings.status'],
            'partnerFinances' => ['partner-finances.viewAny', 'partner-finances.view', 'partner-finances.create', 'partner-finances.update', 'partner-finances.delete'],
            'partnerBanners' => ['partner-banners.viewAny', 'partner-banners.view', 'partner-banners.create', 'partner-banners.update', 'partner-banners.delete'],
            'messages' => ['messages.viewAny', 'messages.view', 'messages.create', 'messages.update', 'messages.delete', 'messages.status'],
            'coupons' => ['coupons.viewAny', 'coupons.view', 'coupons.create', 'coupons.update', 'coupons.delete', 'coupons.status'],
            'emailCsvExport' => ['email-csv-export.view'],
            'users' => ['users.viewAny', 'users.view', 'users.create', 'users.update', 'users.delete'],
            'roles' => ['roles.viewAny', 'roles.view', 'roles.create', 'roles.update', 'roles.delete'],
            'permissions' => ['permissions.viewAny'],
        ];
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
                'is_active' => true,
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
