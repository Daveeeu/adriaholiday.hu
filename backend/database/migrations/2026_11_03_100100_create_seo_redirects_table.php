<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * SEO redirects: old addresses (most of them the legacy site's own redirect
 * list) answered with a permanent (301) redirect when no page lives there
 * any more.
 * Existing installs also get the admin permissions of the new module; fresh
 * databases get them from RolePermissionSeeder.
 */
return new class extends Migration
{
    private const PERMISSIONS = ['seo-redirects.viewAny', 'seo-redirects.view', 'seo-redirects.create', 'seo-redirects.update', 'seo-redirects.delete'];

    /**
     * Roles that manage the module, the same ones that manage the site's content.
     */
    private const ROLES = ['Super Admin', 'Admin', 'Marketing'];

    public function up(): void
    {
        Schema::create('seo_redirects', function (Blueprint $table): void {
            $table->id();
            $table->string('source_path', 512)->unique();
            $table->string('target', 1024);
            $table->boolean('active')->default(true)->index();
            $table->string('origin', 16)->default('manual')->index();
            $table->unsignedInteger('hits')->default(0);
            $table->timestamp('last_hit_at')->nullable();
            $table->timestamps();
        });

        if (! Role::query()->exists()) {
            return;
        }

        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        Role::query()->whereIn('name', self::ROLES)->get()->each(fn (Role $role) => $role->givePermissionTo(self::PERMISSIONS));
        Role::query()->where('name', 'Viewer')->first()?->givePermissionTo(['seo-redirects.viewAny', 'seo-redirects.view']);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_redirects');
        Permission::query()->whereIn('name', self::PERMISSIONS)->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
