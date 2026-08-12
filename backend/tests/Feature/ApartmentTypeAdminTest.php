<?php

namespace Tests\Feature;

use App\Http\Requests\Admin\Apartment\StoreApartmentRequest;
use App\Models\ApartmentType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ApartmentTypeAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_admin_can_list_create_update_and_delete_apartment_types(): void
    {
        $this->actingAsApartmentTypeAdmin();

        ApartmentType::query()->create([
            'slug' => 'greek',
            'name' => 'Görög apartmanok',
            'is_active' => false,
            'sort_order' => 1,
        ]);

        $this->getJson('/api/admin/apartment-types')
            ->assertOk()
            ->assertJsonPath('items.0.slug', 'greek')
            ->assertJsonPath('items.0.isActive', false);

        $created = $this->postJson('/api/admin/apartment-types', [
            'name' => 'Olasz apartmanok',
            'slug' => 'italian',
            'isActive' => true,
            'sortOrder' => 6,
        ])->assertCreated()
            ->assertJsonPath('data.slug', 'italian')
            ->assertJsonPath('data.isActive', true)
            ->json('data');

        $this->patchJson("/api/admin/apartment-types/{$created['id']}", [
            'name' => 'Olasz apartmanok (frissítve)',
            'slug' => 'italian',
            'isActive' => true,
            'sortOrder' => 7,
        ])->assertOk()
            ->assertJsonPath('data.name', 'Olasz apartmanok (frissítve)');

        $this->patchJson("/api/admin/apartment-types/{$created['id']}/status", [
            'isActive' => false,
        ])->assertOk()
            ->assertJsonPath('data.isActive', false);

        $this->deleteJson("/api/admin/apartment-types/{$created['id']}")
            ->assertNoContent();
    }

    public function test_reserved_slug_is_rejected_on_create(): void
    {
        $this->actingAsApartmentTypeAdmin();

        $this->postJson('/api/admin/apartment-types', [
            'name' => 'Régiók',
            'slug' => 'regions',
            'isActive' => true,
            'sortOrder' => 0,
        ])->assertStatus(422)
            ->assertJsonValidationErrors('slug');
    }

    public function test_apartment_type_validation_accepts_inactive_type_and_rejects_unknown_type(): void
    {
        ApartmentType::query()->create([
            'slug' => 'greek',
            'name' => 'Görög apartmanok',
            'is_active' => false,
            'sort_order' => 1,
        ]);

        $rules = (new StoreApartmentRequest)->rules();

        $validForLegacyType = Validator::make(['type' => 'greek'], ['type' => $rules['type']]);
        $this->assertTrue($validForLegacyType->passes());

        $invalidForUnknownType = Validator::make(['type' => 'does-not-exist'], ['type' => $rules['type']]);
        $this->assertFalse($invalidForUnknownType->passes());
    }

    private function actingAsApartmentTypeAdmin(): void
    {
        $permissions = [
            'apartment-types.viewAny',
            'apartment-types.view',
            'apartment-types.create',
            'apartment-types.update',
            'apartment-types.delete',
            'apartment-types.status',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Apartment Type Test Admin', 'web');
        $role->syncPermissions($permissions);

        $user = User::query()->create([
            'name' => 'Apartment Type Test Admin',
            'email' => 'apartment-type-test-admin@example.com',
            'password' => 'password',
        ]);

        $user->assignRole($role);

        Sanctum::actingAs($user);
    }
}
