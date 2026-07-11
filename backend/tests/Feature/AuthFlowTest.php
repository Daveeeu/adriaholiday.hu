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

    /**
     * The login endpoint previously had no rate limiter at all, so an
     * attacker could attempt unlimited password guesses against any known
     * admin email. This proves the "login" limiter (5/min/IP) actually
     * kicks in, returns 429 with a Retry-After header once exhausted, and
     * that a *different* IP is not affected by another IP's attempts.
     */
    public function test_login_is_rate_limited_per_ip(): void
    {
        $user = User::factory()->create([
            'email' => 'ratelimit@example.com',
            'password' => Hash::make('password'),
        ]);
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
        $user->assignRole('Admin');

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', [
                'email' => 'ratelimit@example.com',
                'password' => 'wrong-password',
            ], ['REMOTE_ADDR' => '10.0.0.1'])->assertStatus(422);
        }

        $blocked = $this->postJson('/api/auth/login', [
            'email' => 'ratelimit@example.com',
            'password' => 'password',
        ], ['REMOTE_ADDR' => '10.0.0.1']);

        $blocked->assertStatus(429);
        $blocked->assertHeader('Retry-After');

        // A request from a different IP must not be affected by the first IP's attempts.
        $otherIp = $this->postJson('/api/auth/login', [
            'email' => 'ratelimit@example.com',
            'password' => 'password',
        ], ['REMOTE_ADDR' => '10.0.0.2']);

        $otherIp->assertOk();
    }

    public function test_admin_api_without_session_returns_json_401(): void
    {
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);

        $this->get('/api/admin/apartments')
            ->assertUnauthorized()
            ->assertJsonStructure(['message']);
    }

    public function test_cors_preflight_allows_configured_admin_dev_origin(): void
    {
        $response = $this->withHeaders([
            'Origin' => 'http://localhost:5174',
            'Access-Control-Request-Method' => 'POST',
        ])->options('/api/auth/login');

        $response->assertNoContent();
        $response->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5174');
        $response->assertHeader('Access-Control-Allow-Credentials', 'true');
    }

    public function test_cors_rejects_unlisted_origin(): void
    {
        $response = $this->withHeaders([
            'Origin' => 'http://evil.example.com',
            'Access-Control-Request-Method' => 'POST',
        ])->options('/api/auth/login');

        $response->assertHeaderMissing('Access-Control-Allow-Origin');
    }
}
