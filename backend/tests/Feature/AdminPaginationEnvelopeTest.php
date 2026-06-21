<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AdminPaginationEnvelopeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    /**
     * @return array<string, array{0: string}>
     */
    public static function listEndpointsProvider(): array
    {
        return [
            'apartments' => ['/api/admin/apartments'],
            'homepage-offers' => ['/api/admin/homepage-offers'],
            'blog-articles' => ['/api/admin/blog/articles'],
            'tours' => ['/api/admin/tours'],
            'tour-region-groups' => ['/api/admin/tour-region-groups'],
            'tour-seasonal-groups' => ['/api/admin/tour-seasonal-groups'],
            'tour-departure-places' => ['/api/admin/tour-departure-places'],
            'tour-partner-offers' => ['/api/admin/tour-partner-offers'],
            'regions' => ['/api/admin/regions'],
            'locations' => ['/api/admin/locations'],
            'galleries' => ['/api/admin/galleries'],
            'offers' => ['/api/admin/offers'],
            'blog-categories' => ['/api/admin/blog/categories'],
            'blog-tags' => ['/api/admin/blog/tags'],
            'buses' => ['/api/admin/buses'],
        ];
    }

    #[DataProvider('listEndpointsProvider')]
    public function test_admin_list_endpoints_use_frontend_compatible_envelope(string $endpoint): void
    {
        $user = User::query()->where('email', 'info@jandldavid.hu')->firstOrFail();

        Sanctum::actingAs($user);

        $response = $this->getJson($endpoint.'?page=1&perPage=10');

        $response->assertOk();
        $response->assertJsonStructure([
            'items',
            'totalCount',
            'page',
            'perPage',
        ]);
        $response->assertJsonMissingPath('data');
        $response->assertJsonMissingPath('meta');
    }
}
