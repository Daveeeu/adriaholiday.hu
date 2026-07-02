<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PortfolioContentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    public function test_public_portfolio_content_returns_seeded_home_block(): void
    {
        $response = $this->getJson('/api/portfolio/content?page=home')
            ->assertOk()
            ->json();

        $this->assertSame(
            'gradient',
            $response['home.hero.titleParts']['value']['titleParts'][2]['variant'] ?? null,
        );
    }

    public function test_admin_portfolio_content_returns_seeded_home_block_for_authenticated_user(): void
    {
        $user = User::factory()->create([
            'email' => 'portfolio-editor@example.com',
        ]);
        $user->assignRole('Super Admin');

        Sanctum::actingAs($user);

        $this->getJson('/api/admin/portfolio/content?page=home')
            ->assertOk()
            ->assertJsonFragment([
                'key' => 'home.hero.titleParts',
                'label' => 'Hero főcím',
            ]);
    }
}
