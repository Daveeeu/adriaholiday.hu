<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_me_and_logout_work(): void
    {
        $user = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'info@jandldavid.hu',
            'password' => Hash::make('password'),
        ]);

        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
        $user->assignRole('Admin');

        $login = $this->postJson('/api/auth/login', [
            'email' => 'info@jandldavid.hu',
            'password' => 'password',
        ]);

        $login->assertOk()
            ->assertJsonStructure([
                'token',
                'tokenType',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'roles',
                    'permissions',
                ],
            ]);

        $token = $login->json('token');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('email', 'info@jandldavid.hu');

        $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/auth/logout')
            ->assertOk();

        $this->getJson('/api/auth/me')
            ->assertUnauthorized();
    }

    public function test_login_validation_and_failed_credentials_return_422(): void
    {
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);

        $this->postJson('/api/auth/login', [
            'email' => 'missing@example.com',
            'password' => 'wrong-password',
        ])->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_admin_api_without_session_returns_json_401(): void
    {
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);

        $this->get('/api/admin/apartments')
            ->assertUnauthorized()
            ->assertJsonStructure(['message']);
    }
}
