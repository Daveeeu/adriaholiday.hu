<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrustedProxyTest extends TestCase
{
    use RefreshDatabase;

    private const PROXY_IP = '172.18.0.5';

    public function test_login_rate_limit_is_tracked_per_forwarded_client_ip(): void
    {
        $credentials = ['email' => 'nobody@example.com', 'password' => 'wrong-password'];

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->fromClient('203.0.113.10')->postJson('/api/auth/login', $credentials)->assertStatus(422);
        }

        $this->fromClient('203.0.113.10')->postJson('/api/auth/login', $credentials)->assertTooManyRequests();
        $this->fromClient('203.0.113.20')->postJson('/api/auth/login', $credentials)->assertStatus(422);
    }

    public function test_forwarded_https_scheme_is_honoured_behind_the_proxy(): void
    {
        $this->withServerVariables(['REMOTE_ADDR' => self::PROXY_IP])
            ->withHeader('X-Forwarded-Proto', 'https')
            ->get('/up')
            ->assertOk();

        $this->assertTrue(request()->isSecure());
    }

    private function fromClient(string $clientIp): static
    {
        return $this->withServerVariables(['REMOTE_ADDR' => self::PROXY_IP])
            ->withHeader('X-Forwarded-For', $clientIp);
    }
}
