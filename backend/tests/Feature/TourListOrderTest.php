<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\BlogCategoryTranslation;
use App\Models\HomepageOffer;
use App\Models\HomepageOfferTranslation;
use App\Models\Tour;
use App\Models\TourReferenceOption;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class TourListOrderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_lists_offer_the_tiles_leading_to_a_category_and_the_visited_countries(): void
    {
        $this->actingAsReorderer();
        $category = $this->createCategory('korutazasok');
        $this->createTile('Körutazások', '/kategoriak/korutazasok');
        $this->createTile('Partner', 'https://legjobbutak.hu/');
        $this->createTile('Bibione', '/apartmanok/olaszorszag/bibione');
        $this->createCountry('HR', 'Horvátország');
        $this->createCountry('AT', 'Ausztria');
        $this->createTour('Zágráb', $category, ['HR']);
        $this->createTour('Bécs és Zágráb', $category, ['AT', 'HR']);

        $this->getJson('/api/admin/tour-list-orders')
            ->assertOk()
            ->assertJsonCount(1, 'data.tiles')
            ->assertJsonPath('data.tiles.0.type', 'category')
            ->assertJsonPath('data.tiles.0.key', (string) $category->id)
            ->assertJsonPath('data.tiles.0.label', 'Körutazások')
            ->assertJsonPath('data.tiles.0.tourCount', 2)
            ->assertJsonPath('data.tiles.0.ordered', false)
            ->assertJsonPath('data.countries.0.label', 'Ausztria')
            ->assertJsonPath('data.countries.0.tourCount', 1)
            ->assertJsonPath('data.countries.1.key', 'HR')
            ->assertJsonPath('data.countries.1.tourCount', 2);
    }

    public function test_a_tiles_order_drives_its_category_page_and_leaves_other_lists_alone(): void
    {
        $this->actingAsReorderer();
        $category = $this->createCategory('korutazasok');
        $first = $this->createTour('Első', $category, ['HR'], sortOrder: 1);
        $second = $this->createTour('Második', $category, ['HR'], sortOrder: 2);
        $third = $this->createTour('Harmadik', $category, ['HR'], sortOrder: 3);

        $this->assertSame([$first->id, $second->id, $third->id], $this->categoryPageIds('korutazasok'));

        $this->putJson("/api/admin/tour-list-orders/category/{$category->id}", ['ids' => [$third->id, $first->id]])
            ->assertOk()
            ->assertJsonPath('data.0.id', (string) $third->id)
            ->assertJsonPath('data.0.placed', true)
            ->assertJsonPath('data.2.id', (string) $second->id)
            ->assertJsonPath('data.2.placed', false);

        // The saved order shows at once (the offers cache is renewed); the
        // tour left out follows the placed ones.
        $this->assertSame([$third->id, $first->id, $second->id], $this->categoryPageIds('korutazasok'));
        // A country filter on the category page keeps the tile's order.
        $this->assertSame([$third->id, $first->id, $second->id], $this->categoryPageIds('korutazasok', '&country=HR'));
        // The country itself keeps the global order.
        $this->assertSame([$first->id, $second->id, $third->id], $this->offersPageIds('?country=HR'));
        // A visitor's own order still wins.
        $this->assertSame([$first->id, $third->id, $second->id], $this->categoryPageIds('korutazasok', '&order=name'));
    }

    public function test_a_countrys_order_drives_the_offers_page_filtered_to_that_country_only(): void
    {
        $this->actingAsReorderer();
        $category = $this->createCategory('korutazasok');
        $first = $this->createTour('Első', $category, ['HR', 'ME'], sortOrder: 1, price: 100);
        $second = $this->createTour('Második', $category, ['HR', 'ME'], sortOrder: 2, price: 200);

        $this->putJson('/api/admin/tour-list-orders/country/HR', ['ids' => [$second->id, $first->id]])->assertOk();

        $this->assertSame([$second->id, $first->id], $this->offersPageIds('?country=HR'));
        $this->assertSame([$first->id, $second->id], $this->offersPageIds('?country=ME'));
        $this->assertSame([$first->id, $second->id], $this->offersPageIds('?country=HR,ME'));
        $this->assertSame([$first->id, $second->id], $this->offersPageIds(''));
        $this->assertSame([$first->id, $second->id], $this->offersPageIds('?country=HR&order=price_asc'));
    }

    public function test_resetting_a_list_returns_it_to_the_global_order(): void
    {
        $this->actingAsReorderer();
        $category = $this->createCategory('korutazasok');
        $first = $this->createTour('Első', $category, ['HR'], sortOrder: 1);
        $second = $this->createTour('Második', $category, ['HR'], sortOrder: 2);

        $this->putJson('/api/admin/tour-list-orders/country/HR', ['ids' => [$second->id, $first->id]])->assertOk();
        $this->assertSame([$second->id, $first->id], $this->offersPageIds('?country=HR'));

        $this->deleteJson('/api/admin/tour-list-orders/country/HR')
            ->assertOk()
            ->assertJsonPath('data.0.id', (string) $first->id)
            ->assertJsonPath('data.0.placed', false);

        $this->assertSame([$first->id, $second->id], $this->offersPageIds('?country=HR'));
    }

    public function test_only_the_lists_own_tours_can_be_placed_on_it(): void
    {
        $this->actingAsReorderer();
        $category = $this->createCategory('korutazasok');
        $croatian = $this->createTour('Zágráb', $category, ['HR']);
        $italian = $this->createTour('Róma', $category, ['IT']);
        $hidden = $this->createTour('Rejtett', $category, ['HR'], listed: false);

        $this->putJson('/api/admin/tour-list-orders/country/HR', ['ids' => [$croatian->id, $italian->id]])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('ids');
        $this->putJson('/api/admin/tour-list-orders/country/HR', ['ids' => [$hidden->id]])
            ->assertUnprocessable();
        $this->putJson('/api/admin/tour-list-orders/country/HR', ['ids' => [$croatian->id, $croatian->id]])
            ->assertUnprocessable();
        $this->assertTrue($this->putJson('/api/admin/tour-list-orders/region/HR', ['ids' => [$croatian->id]])->isClientError());

        $this->assertDatabaseCount('tour_list_positions', 0);
    }

    public function test_ordering_lists_needs_the_reorder_permission(): void
    {
        $category = $this->createCategory('korutazasok');
        $tour = $this->createTour('Zágráb', $category, ['HR']);

        $this->getJson('/api/admin/tour-list-orders')->assertUnauthorized();

        Sanctum::actingAs($this->createUser('viewer@example.com', ['tours.viewAny']));

        $this->getJson('/api/admin/tour-list-orders')->assertForbidden();
        $this->getJson('/api/admin/tour-list-orders/country/HR')->assertForbidden();
        $this->putJson('/api/admin/tour-list-orders/country/HR', ['ids' => [$tour->id]])->assertForbidden();
        $this->deleteJson('/api/admin/tour-list-orders/country/HR')->assertForbidden();
    }

    /**
     * @return array<int, int>
     */
    private function categoryPageIds(string $slug, string $query = ''): array
    {
        return collect($this->getJson("/api/portfolio/categories/{$slug}/offers?perPage=24{$query}")->assertOk()->json('items'))
            ->pluck('id')
            ->all();
    }

    /**
     * @return array<int, int>
     */
    private function offersPageIds(string $query): array
    {
        return collect($this->getJson('/api/portfolio/offers'.$query)->assertOk()->json('items'))
            ->pluck('id')
            ->all();
    }

    private function actingAsReorderer(): void
    {
        Sanctum::actingAs($this->createUser('reorderer@example.com', ['tours.viewAny', 'tours.reorder']));
    }

    /**
     * @param  array<int, string>  $permissions
     */
    private function createUser(string $email, array $permissions): User
    {
        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $user = User::query()->create([
            'name' => $email,
            'email' => $email,
            'password' => 'password',
            'active' => true,
        ]);
        $user->givePermissionTo($permissions);

        return $user;
    }

    private function createCategory(string $slug): BlogCategory
    {
        $category = BlogCategory::query()->create([
            'active' => true,
            'column' => '1',
            'seo_name' => $slug,
            'sort_order' => 1,
        ]);

        BlogCategoryTranslation::query()->create([
            'blog_category_id' => $category->id,
            'locale' => 'hu',
            'name' => $slug,
            'seo_name' => $slug,
            'seo_auto_generate' => true,
        ]);

        return $category;
    }

    private function createTile(string $name, string $link): void
    {
        $tile = HomepageOffer::query()->create(['active' => true, 'sort_order' => 1, 'image_title' => $name, 'link' => $link]);

        HomepageOfferTranslation::query()->create([
            'homepage_offer_id' => $tile->id,
            'locale' => 'hu',
            'name' => $name,
            'seo_name' => $name,
        ]);
    }

    private function createCountry(string $code, string $name): void
    {
        TourReferenceOption::query()->create([
            'type' => 'country',
            'code' => $code,
            'name' => $name,
            'active' => true,
            'sort_order' => 1,
        ]);
    }

    /**
     * @param  array<int, string>  $countryCodes
     */
    private function createTour(string $name, BlogCategory $category, array $countryCodes, int $sortOrder = 1, bool $listed = true, float $price = 1000): Tour
    {
        return Tour::factory()->create([
            'name' => $name,
            'listed' => $listed,
            'category_ids' => [(string) $category->id],
            'country_ids' => $countryCodes,
            'sort_order' => $sortOrder,
            'travel_mode_id' => 'bus',
            'price' => $price,
        ]);
    }
}
