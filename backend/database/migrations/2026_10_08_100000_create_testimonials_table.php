<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * "Rólunk írták": letters and travel reports of guests, shown on the home page
 * and on their own page. Existing installs also get the admin permissions of
 * the new module; fresh databases get them from RolePermissionSeeder.
 */
return new class extends Migration
{
    private const PERMISSIONS = ['testimonials.viewAny', 'testimonials.view', 'testimonials.create', 'testimonials.update', 'testimonials.delete'];

    /**
     * Roles that manage the module, the same ones that manage the home page content.
     */
    private const ROLES = ['Super Admin', 'Admin', 'Marketing', 'Content Editor'];

    public function up(): void
    {
        Schema::create('testimonials', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('author')->nullable();
            $table->longText('body');
            $table->timestamp('published_at')->index();
            $table->boolean('active')->default(true)->index();
            $table->unsignedBigInteger('legacy_id')->nullable()->unique();
            $table->timestamps();
        });

        if (! Role::query()->exists()) {
            return;
        }

        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        Role::query()->whereIn('name', self::ROLES)->get()->each(fn (Role $role) => $role->givePermissionTo(self::PERMISSIONS));
        Role::query()->where('name', 'Viewer')->first()?->givePermissionTo(['testimonials.viewAny', 'testimonials.view']);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
        Permission::query()->whereIn('name', self::PERMISSIONS)->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
