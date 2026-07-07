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
