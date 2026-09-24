<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
            $response['home.hero.titleParts']['value']['titleParts'][1]['variant'] ?? null,
        );
    }

    public function test_public_portfolio_content_returns_about_page_blocks(): void
    {
        $response = $this->getJson('/api/portfolio/content?page=about')
            ->assertOk()
            ->json();

        $this->assertSame('2003', $response['about.hero.stats']['value'][0]['value'] ?? null);
        $this->assertCount(3, $response['about.difference.pillars']['value'] ?? []);
        $this->assertNull($response['about.team.image']['value'] ?? null);
        $this->assertArrayNotHasKey('home.hero.titleParts', $response);
    }

    public function test_about_page_photos_accept_media_uploads(): void
    {
        $user = User::factory()->create();
        $user->assignRole('Super Admin');

        Sanctum::actingAs($user);
        Storage::fake(config('media-library.disk_name'));

        $this->postJson('/api/admin/portfolio/content/about.team.image/media', [
            'file' => UploadedFile::fake()->image('csapat.jpg', 1600, 1000),
            'alt' => 'Az Adria Holiday csapata',
        ])
            ->assertOk()
            ->assertJsonPath('data.key', 'about.team.image');
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
