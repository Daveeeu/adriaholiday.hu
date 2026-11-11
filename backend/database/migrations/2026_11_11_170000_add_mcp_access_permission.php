<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * The permission to connect Claude, ChatGPT or Gemini to the read-only MCP server
 * (routes/ai.php). Existing installs give it to the Super Admin and Admin
 * roles; fresh databases get it from RolePermissionSeeder.
 */
return new class extends Migration
{
    private const PERMISSION = 'mcp.access';

    private const ROLES = ['Super Admin', 'Admin'];

    public function up(): void
    {
        if (! Role::query()->exists()) {
            return;
        }

        Permission::findOrCreate(self::PERMISSION, 'web');

        Role::query()->whereIn('name', self::ROLES)->get()->each(fn (Role $role) => $role->givePermissionTo(self::PERMISSION));

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        Permission::query()->where('name', self::PERMISSION)->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
