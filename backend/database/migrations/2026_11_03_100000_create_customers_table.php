<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Customers: the registered accounts of the legacy site (contact details,
 * referral code, registration coupon), kept so the office still sees who its
 * customers are. They have no login here; their bookings are matched by
 * e-mail. Existing installs also get the admin permissions of the new module;
 * fresh databases get them from RolePermissionSeeder.
 */
return new class extends Migration
{
    private const PERMISSIONS = ['customers.viewAny', 'customers.view', 'customers.create', 'customers.update', 'customers.delete'];

    /**
     * Roles that manage the module, the same ones that manage the bookings.
     */
    private const ROLES = ['Super Admin', 'Admin', 'Sales'];

    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table): void {
            $table->id();
            $table->string('email')->unique();
            $table->string('name')->nullable()->index();
            $table->string('phone', 64)->nullable();
            $table->string('postal_code', 16)->nullable();
            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->string('referral_code', 32)->nullable()->unique();
            $table->unsignedInteger('registration_coupon_value')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('registered_at')->nullable()->index();
            $table->timestamp('first_login_at')->nullable();
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
        Role::query()->where('name', 'Viewer')->first()?->givePermissionTo(['customers.viewAny', 'customers.view']);

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
        Permission::query()->whereIn('name', self::PERMISSIONS)->delete();
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
};
