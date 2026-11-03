<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Pages: free text pages served at their own address ("/autobuszaink"), and
 * text blocks (short texts without an address, e.g. a note under a booking
 * form). Existing installs also get the admin permissions of the new module;
 * fresh databases get them from RolePermissionSeeder.
 */
return new class extends Migration
{
    private const PERMISSIONS = ['pages.viewAny', 'pages.view', 'pages.create', 'pages.update', 'pages.delete'];

    /**
     * Roles that manage the module, the same ones that manage the site's content.
     */
    private const ROLES = ['Super Admin', 'Admin', 'Marketing', 'Content Editor'];

    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table): void {
            $table->id();
            $table->string('kind', 16)->default('page')->index();
            $table->string('title');
            $table->string('slug')->nullable()->unique();
            $table->longText('content')->nullable();
            $table->string('seo_title')->nullable();
            $table->string('seo_description', 512)->nullable();
            $table->string('seo_robots', 64)->nullable();
            $table->boolean('active')->default(false)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        if (! Role::query()->exists()) {
            return;
        }

        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        Role::query()->whereIn('name', self::ROLES)->get()->each(fn (Role $role) => $role->givePermissionTo(self::PERMISSIONS));
        Role::query()->where('name', 'Viewer')->first()?->givePermissionTo(['pages.viewAny', 'pages.view']);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        Schema::dropIfExists('pages');
        Permission::query()->whereIn('name', self::PERMISSIONS)->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
