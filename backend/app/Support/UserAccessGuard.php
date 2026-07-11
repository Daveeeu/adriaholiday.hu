<?php

namespace App\Support;

use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Spatie\Permission\Models\Role;

class UserAccessGuard
{
    public const SUPER_ADMIN_ROLE = 'Super Admin';

    /**
     * @param  array<int, string>  $roleNames
     */
    public static function syncRoles(User $actor, User $target, array $roleNames): void
    {
        $grantsSuperAdmin = in_array(self::SUPER_ADMIN_ROLE, $roleNames, true);
        $revokesSuperAdmin = ! $grantsSuperAdmin && $target->hasRole(self::SUPER_ADMIN_ROLE);

        if (($grantsSuperAdmin || $revokesSuperAdmin) && ! $actor->hasRole(self::SUPER_ADMIN_ROLE)) {
            throw new AuthorizationException('Only a Super Admin can grant or revoke the Super Admin role.');
        }

        if ($revokesSuperAdmin) {
            self::assertNotLastSuperAdmin($target);
        }

        $target->syncRoles($roleNames);
    }

    /**
     * Grants/revokes permissions directly on a user or role, but never lets
     * a non-Super-Admin actor hand out a permission they do not themselves
     * hold. Without this, a plain "Admin" account could bypass the
     * Super-Admin-only role guard above entirely by self-granting
     * `roles.*`/`permissions.*` permissions directly (instead of the
     * "Super Admin" role) and then using those to manage roles/permissions
     * freely.
     *
     * @param  array<int, string>  $permissionNames
     */
    public static function syncPermissions(User $actor, User|Role $target, array $permissionNames): void
    {
        if (! $actor->hasRole(self::SUPER_ADMIN_ROLE)) {
            $actorPermissions = $actor->getAllPermissions()->pluck('name')->all();
            $ungranted = array_values(array_diff($permissionNames, $actorPermissions));

            if ($ungranted !== []) {
                throw new AuthorizationException(
                    'You cannot grant permissions you do not hold yourself: '.implode(', ', $ungranted).'.'
                );
            }
        }

        $target->syncPermissions($permissionNames);
    }

    public static function guardDeactivation(User $actor, User $target): void
    {
        if ($actor->is($target)) {
            throw new AuthorizationException('You cannot deactivate your own account.');
        }

        if ($target->hasRole(self::SUPER_ADMIN_ROLE)) {
            self::assertNotLastSuperAdmin($target);
        }
    }

    public static function guardRoleDeletion(Role $role): void
    {
        if (in_array($role->name, [self::SUPER_ADMIN_ROLE, 'Admin'], true)) {
            throw new AuthorizationException("The \"{$role->name}\" role cannot be deleted.");
        }

        if ($role->users()->exists()) {
            throw new AuthorizationException('This role is still assigned to users. Reassign them before deleting it.');
        }
    }

    private static function assertNotLastSuperAdmin(User $target): void
    {
        $activeSuperAdminCount = User::role(self::SUPER_ADMIN_ROLE)
            ->where('is_active', true)
            ->where('id', '!=', $target->id)
            ->count();

        if ($activeSuperAdminCount === 0) {
            throw new AuthorizationException('At least one active Super Admin must remain.');
        }
    }
}
