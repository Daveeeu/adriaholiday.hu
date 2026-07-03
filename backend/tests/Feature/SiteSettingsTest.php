<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\SiteSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SiteSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            RolePermissionSeeder::class,
            SiteSettingsSeeder::class,
        ]);
    }

    public function test_public_site_settings_endpoint_returns_only_public_items(): void
    {
        $response = $this->getJson('/api/portfolio/site-settings')
            ->assertOk()
            ->json();

        $this->assertSame('Adria Holiday', $response['general']['site_name'] ?? null);
        $this->assertSame('/kapcsolat', $response['cta']['primary_link'] ?? null);
        $this->assertArrayNotHasKey('analytics', $response);
    }

    public function test_private_setting_does_not_leak_to_public_endpoint(): void
    {
        $response = $this->getJson('/api/portfolio/site-settings')
            ->assertOk()
            ->json();

        $this->assertFalse(isset($response['analytics']['meta_pixel_id']));
        $this->assertFalse(isset($response['analytics']['meta_pixel_enabled']));
    }

    public function test_admin_update_site_settings_works(): void
    {
        Permission::findOrCreate('site-settings.view', 'web');
        Permission::findOrCreate('site-settings.update', 'web');

        $role = Role::findOrCreate('Site Settings Admin', 'web');
        $role->syncPermissions(['site-settings.view', 'site-settings.update']);

        $user = User::factory()->create([
            'email' => 'site-settings-admin@example.com',
        ]);
        $user->assignRole($role);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/admin/site-settings', [
            'items' => [
                [
                    'group' => 'general',
                    'key' => 'site_name',
                    'type' => 'string',
                    'isPublic' => true,
                    'value' => 'Új Adria Holiday',
                ],
                [
                    'group' => 'analytics',
                    'key' => 'meta_pixel_enabled',
                    'type' => 'boolean',
                    'isPublic' => false,
                    'value' => true,
                ],
            ],
        ]);

        $response->assertOk()
            ->assertJsonFragment([
                'group' => 'general',
                'key' => 'site_name',
                'value' => 'Új Adria Holiday',
            ])
            ->assertJsonFragment([
                'group' => 'analytics',
                'key' => 'meta_pixel_enabled',
                'value' => true,
            ]);

        $this->getJson('/api/portfolio/site-settings')
            ->assertOk()
            ->assertJsonPath('general.site_name', 'Új Adria Holiday')
            ->assertJsonMissingPath('analytics');
    }
}
