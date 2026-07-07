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
