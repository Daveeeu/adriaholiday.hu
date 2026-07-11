<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AdminUserRolePermissionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        $this->seed(RolePermissionSeeder::class);
    }

    private function userWithRole(string $role, bool $isActive = true): User
    {
        $user = User::query()->create([
            'name' => $role.' User',
            'email' => strtolower(str_replace(' ', '.', $role)).'-'.Str::random(8).'@example.test',
            'password' => 'password',
            'is_active' => $isActive,
        ]);

        $user->assignRole($role);

        return $user;
    }

    public function test_guest_cannot_access_admin_endpoints(): void
    {
        $this->getJson('/api/admin/users')->assertStatus(401);
    }

    public function test_viewer_can_list_tours_but_cannot_manage_users(): void
    {
        Sanctum::actingAs($this->userWithRole('Viewer'));

        // Viewer has read access to business content...
        $this->getJson('/api/admin/tours')->assertOk();

        // ...but no access at all to user/role/permission governance, even read-only.
        $this->getJson('/api/admin/users')->assertStatus(403);

        $this->postJson('/api/admin/users', [
            'name' => 'Blocked',
            'email' => 'blocked@example.test',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertStatus(403);
    }

    public function test_viewer_is_blocked_from_every_tour_write_endpoint(): void
    {
        $tour = Tour::factory()->create();

        Sanctum::actingAs($this->userWithRole('Viewer'));

        $this->postJson('/api/admin/tours', ['name' => 'Test'])->assertStatus(403);
        $this->patchJson("/api/admin/tours/{$tour->id}/status", ['active' => true])->assertStatus(403);
    }

    public function test_super_admin_has_full_access(): void
    {
        Sanctum::actingAs($this->userWithRole('Super Admin'));

        $this->getJson('/api/admin/users')->assertOk();
        $this->getJson('/api/admin/roles')->assertOk();
        $this->getJson('/api/admin/permissions')->assertOk();
        $this->getJson('/api/admin/dashboard/summary')->assertStatus(200);
    }

    public function test_marketing_cannot_delete_a_tour(): void
    {
        $tour = Tour::factory()->create();
        $marketing = $this->userWithRole('Marketing');
        Sanctum::actingAs($marketing);

        $this->deleteJson("/api/admin/tours/{$tour->id}")->assertStatus(403);
    }

    public function test_content_editor_cannot_manage_roles(): void
    {
        Sanctum::actingAs($this->userWithRole('Content Editor'));

        $this->getJson('/api/admin/roles')->assertStatus(403);
        $this->postJson('/api/admin/roles', ['name' => 'New Role'])->assertStatus(403);
    }

    public function test_admin_cannot_create_or_view_roles(): void
    {
        Sanctum::actingAs($this->userWithRole('Admin'));

        $this->getJson('/api/admin/roles')->assertStatus(403);
        $this->postJson('/api/admin/roles', ['name' => 'New Role'])->assertStatus(403);
        $this->getJson('/api/admin/permissions')->assertStatus(403);
    }

    public function test_admin_cannot_grant_super_admin_role_to_another_user(): void
    {
        $admin = $this->userWithRole('Admin');
        $target = $this->userWithRole('Viewer');

        Sanctum::actingAs($admin);

        $this->putJson("/api/admin/users/{$target->id}", [
            'name' => $target->name,
            'email' => $target->email,
            'roles' => ['Super Admin'],
        ])->assertStatus(403);

        $this->assertFalse($target->fresh()->hasRole('Super Admin'));
    }

    public function test_super_admin_can_grant_super_admin_role(): void
    {
        $superAdmin = $this->userWithRole('Super Admin');
        $target = $this->userWithRole('Viewer');

        Sanctum::actingAs($superAdmin);

        $this->putJson("/api/admin/users/{$target->id}", [
            'name' => $target->name,
            'email' => $target->email,
            'roles' => ['Super Admin'],
        ])->assertOk();

        $this->assertTrue($target->fresh()->hasRole('Super Admin'));
    }

    /**
     * Reproduces the privilege-escalation gap directly: the "Admin" role
     * has every permission except role/permission management ones, and
     * has users.update, so it could previously call syncPermissions() on
     * itself with role/permission-management permission *names* directly
     * (bypassing the Super-Admin-only role guard, which only inspected
     * role names, never raw permission grants). Once granted directly,
     * those permissions work exactly like role-based ones for Spatie's
     * hasPermissionTo(), so the actor would then have full access to
     * RoleController despite never holding the "Super Admin" role.
     */
    public function test_admin_cannot_self_grant_role_management_permissions(): void
    {
        $admin = $this->userWithRole('Admin');
        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/admin/users/{$admin->id}", [
            'name' => $admin->name,
            'email' => $admin->email,
            'permissions' => ['roles.update', 'roles.create', 'permissions.viewAny'],
        ]);

        $response->assertStatus(403);

        $fresh = $admin->fresh();
        $this->assertFalse($fresh->hasPermissionTo('roles.update'));
        $this->assertFalse($fresh->hasPermissionTo('roles.create'));
        $this->assertFalse($fresh->hasPermissionTo('permissions.viewAny'));
    }

    public function test_admin_cannot_grant_role_management_permissions_to_another_user(): void
    {
        $admin = $this->userWithRole('Admin');
        $target = $this->userWithRole('Viewer');
        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/admin/users/{$target->id}", [
            'name' => $target->name,
            'email' => $target->email,
            'permissions' => ['roles.update'],
        ]);

        $response->assertStatus(403);
        $this->assertFalse($target->fresh()->hasPermissionTo('roles.update'));
    }

    public function test_admin_can_still_grant_permissions_they_already_hold(): void
    {
        $admin = $this->userWithRole('Admin');
        $target = $this->userWithRole('Viewer');
        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/admin/users/{$target->id}", [
            'name' => $target->name,
            'email' => $target->email,
            'permissions' => ['tours.delete'],
        ]);

        $response->assertOk();
        $this->assertTrue($target->fresh()->hasPermissionTo('tours.delete'));
    }

    public function test_admin_cannot_self_grant_role_management_permissions_via_role_creation(): void
    {
        // Admin has no roles.create permission at all, so this is blocked
        // before it can ever reach the escalation path above — asserted
        // here as a belt-and-suspenders check on the first gate.
        $admin = $this->userWithRole('Admin');
        Sanctum::actingAs($admin);

        $this->postJson('/api/admin/roles', [
            'name' => 'Self Made Super Role',
            'permissions' => ['roles.update', 'permissions.viewAny'],
        ])->assertStatus(403);
    }

    public function test_super_admin_can_create_a_role_with_role_management_permissions(): void
    {
        Sanctum::actingAs($this->userWithRole('Super Admin'));

        $response = $this->postJson('/api/admin/roles', [
            'name' => 'Custom Role Manager',
            'permissions' => ['roles.viewAny', 'roles.update'],
        ]);

        $response->assertCreated();

        $role = Role::where('name', 'Custom Role Manager')->firstOrFail();
        $this->assertTrue($role->hasPermissionTo('roles.update'));
    }

    public function test_user_cannot_deactivate_their_own_account(): void
    {
        $admin = $this->userWithRole('Admin');
        Sanctum::actingAs($admin);

        $this->deleteJson("/api/admin/users/{$admin->id}")->assertStatus(403);
    }

    public function test_last_super_admin_cannot_be_deactivated(): void
    {
        // The seeder itself creates one Super Admin (env-driven bootstrap account); neutralize it
        // so this test controls the exact number of active Super Admins.
        User::role('Super Admin')->update(['is_active' => false]);

        $superAdminA = $this->userWithRole('Super Admin');
        $superAdminB = $this->userWithRole('Super Admin');
        $admin = $this->userWithRole('Admin');

        Sanctum::actingAs($admin);

        // Two Super Admins exist, so deactivating one of them is allowed.
        $this->deleteJson("/api/admin/users/{$superAdminB->id}")->assertNoContent();

        // Now $superAdminA is the last active Super Admin; deactivating them must be blocked.
        $this->deleteJson("/api/admin/users/{$superAdminA->id}")->assertStatus(403);
    }

    public function test_deactivated_users_token_is_rejected_immediately(): void
    {
        $user = $this->userWithRole('Viewer');
        $token = $user->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/dashboard/summary')
            ->assertOk();

        $user->update(['is_active' => false]);

        // Laravel's RequestGuard caches the resolved user for the guard instance's lifetime;
        // force re-resolution so this second call reflects the just-persisted deactivation,
        // exactly as a fresh incoming HTTP request would in production.
        $this->app['auth']->forgetGuards();

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/admin/dashboard/summary')
            ->assertStatus(403);
    }

    public function test_deactivated_user_cannot_login(): void
    {
        $user = User::query()->create([
            'name' => 'Inactive User',
            'email' => 'inactive@example.test',
            'password' => 'password',
            'is_active' => false,
        ]);
        $user->assignRole('Viewer');

        $this->postJson('/api/auth/login', [
            'email' => 'inactive@example.test',
            'password' => 'password',
        ])->assertStatus(422);
    }

    public function test_denied_permission_overrides_role_grant(): void
    {
        $tour = Tour::factory()->create();
        $superAdmin = $this->userWithRole('Super Admin');
        $contentEditor = $this->userWithRole('Content Editor');

        Sanctum::actingAs($superAdmin);

        $this->putJson("/api/admin/users/{$contentEditor->id}", [
            'name' => $contentEditor->name,
            'email' => $contentEditor->email,
            'roles' => ['Content Editor'],
            'denied_permissions' => ['tours.delete'],
        ])->assertOk();

        Sanctum::actingAs($contentEditor->fresh());

        $this->deleteJson("/api/admin/tours/{$tour->id}")->assertStatus(403);
    }

    public function test_role_cannot_be_deleted_while_assigned_to_users(): void
    {
        $this->userWithRole('Sales');
        Sanctum::actingAs($this->userWithRole('Super Admin'));

        $salesRole = Role::where('name', 'Sales')->firstOrFail();

        $this->deleteJson("/api/admin/roles/{$salesRole->id}")->assertStatus(403);
    }

    public function test_built_in_roles_cannot_be_deleted(): void
    {
        Sanctum::actingAs($this->userWithRole('Super Admin'));

        $adminRole = Role::where('name', 'Admin')->firstOrFail();

        $this->deleteJson("/api/admin/roles/{$adminRole->id}")->assertStatus(403);
    }
}
