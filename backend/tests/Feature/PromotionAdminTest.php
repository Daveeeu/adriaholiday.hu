<?php

namespace Tests\Feature;

use App\Models\Promotion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class PromotionAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_admin_can_list_create_update_status_and_delete_promotions(): void
    {
        $this->actingAsPromotionAdmin();

        $this->getJson('/api/admin/bookings/promotions')
            ->assertOk()
            ->assertJsonPath('items', []);

        $created = $this->postJson('/api/admin/bookings/promotions', [
            'title' => 'Nyári akció',
            'message' => '10% kedvezmény minden foglalásra.',
            'code' => 'NYAR10',
            'isActive' => true,
            'startsAt' => null,
            'expiresAt' => null,
        ])->assertCreated()
            ->assertJsonPath('data.title', 'Nyári akció')
            ->assertJsonPath('data.code', 'NYAR10')
            ->assertJsonPath('data.isActive', true)
            ->json('data');

        $this->patchJson("/api/admin/bookings/promotions/{$created['id']}", [
            'title' => 'Nyári akció (frissítve)',
            'message' => '15% kedvezmény minden foglalásra.',
            'code' => 'NYAR15',
            'isActive' => true,
            'startsAt' => null,
            'expiresAt' => null,
        ])->assertOk()
            ->assertJsonPath('data.title', 'Nyári akció (frissítve)')
            ->assertJsonPath('data.code', 'NYAR15');

        $this->patchJson("/api/admin/bookings/promotions/{$created['id']}/status", [
            'isActive' => false,
        ])->assertOk()
            ->assertJsonPath('data.isActive', false);

        $this->deleteJson("/api/admin/bookings/promotions/{$created['id']}")
            ->assertNoContent();
    }

    public function test_expires_at_must_not_precede_starts_at(): void
    {
        $this->actingAsPromotionAdmin();

        $this->postJson('/api/admin/bookings/promotions', [
            'title' => 'Rossz dátum',
            'message' => 'Teszt',
            'code' => null,
            'isActive' => true,
            'startsAt' => '2026-06-10',
            'expiresAt' => '2026-06-01',
        ])->assertStatus(422)
            ->assertJsonValidationErrors('expires_at');
    }

    public function test_public_active_promotion_endpoint_returns_current_window_promotion(): void
    {
        Promotion::query()->create([
            'title' => 'Inaktív promóció',
            'message' => 'Nem aktív.',
            'code' => 'INACTIVE',
            'is_active' => false,
        ]);

        Promotion::query()->create([
            'title' => 'Lejárt promóció',
            'message' => 'Lejárt.',
            'code' => 'EXPIRED',
            'is_active' => true,
            'expires_at' => now()->subDay()->toDateString(),
        ]);

        Promotion::query()->create([
            'title' => 'Jövőbeli promóció',
            'message' => 'Még nem kezdődött.',
            'code' => 'FUTURE',
            'is_active' => true,
            'starts_at' => now()->addDay()->toDateString(),
        ]);

        $activePromotion = Promotion::query()->create([
            'title' => 'Nyári akció',
            'message' => '10% kedvezmény minden foglalásra.',
            'code' => 'NYAR10',
            'is_active' => true,
        ]);

        $this->getJson('/api/portfolio/promotion')
            ->assertOk()
            ->assertJsonPath('promotion.id', (string) $activePromotion->id)
            ->assertJsonPath('promotion.code', 'NYAR10')
            ->assertJsonMissingPath('promotion.isActive');
    }

    public function test_public_active_promotion_endpoint_returns_null_when_none_qualify(): void
    {
        Promotion::query()->create([
            'title' => 'Inaktív promóció',
            'message' => 'Nem aktív.',
            'code' => 'INACTIVE',
            'is_active' => false,
        ]);

        $this->getJson('/api/portfolio/promotion')
            ->assertOk()
            ->assertJsonPath('promotion', null);
    }

    private function actingAsPromotionAdmin(): void
    {
        $permissions = [
            'promotions.viewAny',
            'promotions.view',
            'promotions.create',
            'promotions.update',
            'promotions.delete',
            'promotions.status',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Promotion Test Admin', 'web');
        $role->syncPermissions($permissions);

        $user = User::query()->create([
            'name' => 'Promotion Test Admin',
            'email' => 'promotion-test-admin@example.com',
            'password' => 'password',
        ]);

        $user->assignRole($role);

        Sanctum::actingAs($user);
    }
}
