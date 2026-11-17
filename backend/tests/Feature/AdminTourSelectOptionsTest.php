<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\BlogCategoryTranslation;
use App\Models\BlogTag;
use App\Models\BlogTagTranslation;
use App\Models\Region;
use App\Models\TourDeparturePlace;
use App\Models\TourReferenceOption;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AdminTourSelectOptionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_tour_select_options_return_labels_and_create_values(): void
    {
        $this->actingAsAdmin();
        $this->seedSelectFixtures();

        $this->getJson('/api/admin/select-options/regions?search=olasz')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.label', 'Olaszország');

        $this->getJson('/api/admin/select-options/departure-places')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.label', 'Budapest');

        $this->getJson('/api/admin/select-options/countries')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.label', 'Horvátország');

        $this->getJson('/api/admin/select-options/program-types')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.label', 'Tengerparti program');

        $this->getJson('/api/admin/select-options/travel-modes')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.label', 'Buszos utazás');

        $this->getJson('/api/admin/select-options/blog-tags')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.label', 'Családi');

        $this->getJson('/api/admin/select-options/blog-categories')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.label', 'Klasszikus körutazás');

        $this->postJson('/api/admin/regions', [
            'name' => 'Dalmácia',
            'slug' => 'dalmacia',
            'country_code' => 'hr',
            'timezone' => 'Europe/Zagreb',
            'currency' => 'EUR',
            'hero_image_url' => null,
            'summary' => null,
            'description' => null,
            'is_active' => true,
            'sort_order' => 0,
            'portfolio_featured' => false,
            'portfolio_sort_order' => 0,
            'portfolio_image_url' => null,
            'portfolio_short_description' => null,
        ])->assertCreated();

        $this->postJson('/api/admin/countries', [
            'name' => 'Szerbia',
            'code' => 'rs',
        ])
            ->assertOk()
            ->assertJsonPath('id', 'rs')
            ->assertJsonPath('label', 'Szerbia');

        $this->postJson('/api/admin/program-types', [
            'name' => 'Körutazás',
            'code' => 'korutazas',
        ])
            ->assertOk()
            ->assertJsonPath('id', 'korutazas')
            ->assertJsonPath('label', 'Körutazás');

        $this->postJson('/api/admin/travel-modes', [
            'name' => 'Repülős utazás',
            'code' => 'repulos-utazas',
        ])
            ->assertOk()
            ->assertJsonPath('id', 'repulos-utazas')
            ->assertJsonPath('label', 'Repülős utazás');

        $this->postJson('/api/admin/blog/tags', [
            'active' => true,
            'sort_order' => 0,
            'translations' => [
                'hu' => ['name' => 'Tengerpart'],
                'en' => ['name' => 'Tengerpart'],
                'de' => ['name' => 'Tengerpart'],
            ],
        ])->assertCreated();

        $this->postJson('/api/admin/blog/categories', [
            'active' => true,
            'column' => '1',
            'sort_order' => 0,
            'translations' => [
                'hu' => ['name' => 'Klasszikus körutazás', 'seo_name' => 'klasszikus-korutazas', 'seo_auto_generate' => true],
                'en' => ['name' => 'Klasszikus körutazás', 'seo_name' => 'klasszikus-korutazas', 'seo_auto_generate' => true],
                'de' => ['name' => 'Klasszikus körutazás', 'seo_name' => 'klasszikus-korutazas', 'seo_auto_generate' => true],
            ],
        ])->assertCreated();

        $this->getJson('/api/admin/select-options/regions?search=dalmacia')
            ->assertOk()
            ->assertJsonFragment(['label' => 'Dalmácia']);

        $this->getJson('/api/admin/select-options/countries?search=sz')
            ->assertOk()
            ->assertJsonFragment(['label' => 'Szerbia']);

        $this->getJson('/api/admin/select-options/blog-tags?search=tenger')
            ->assertOk()
            ->assertJsonFragment(['label' => 'Tengerpart']);

        $this->getJson('/api/admin/select-options/blog-categories?search=klasszikus')
            ->assertOk()
            ->assertJsonFragment(['label' => 'Klasszikus körutazás']);
    }

    public function test_the_select_options_of_the_deleted_tour_fields_are_gone(): void
    {
        $this->actingAsAdmin();

        foreach (['groups', 'offer-groups', 'homepage-offers', 'fits', 'difficulties'] as $endpoint) {
            $this->getJson("/api/admin/select-options/{$endpoint}")->assertNotFound();
        }

        // No such endpoint: either no route at all or none for POST.
        foreach (['fits', 'difficulties'] as $endpoint) {
            $this->assertContains($this->postJson("/api/admin/{$endpoint}", ['name' => 'Teszt', 'code' => 'teszt'])->status(), [404, 405]);
        }
    }

    private function actingAsAdmin(): void
    {
        $permissions = [
            'regions.create',
            'blog-tags.create',
            'blog-categories.create',
            'select-options.view',
            'tour-reference-options.create',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Select Options Test Admin', 'web');
        $role->syncPermissions($permissions);

        $user = User::query()->create([
            'name' => 'Select Options Test Admin',
            'email' => 'select-options-test-admin@example.com',
            'password' => 'password',
        ]);

        $user->assignRole($role);

        Sanctum::actingAs($user);
    }

    private function seedSelectFixtures(): void
    {
        Region::query()->create([
            'slug' => 'olaszorszag',
            'name' => 'Olaszország',
            'country_code' => 'IT',
            'timezone' => 'Europe/Rome',
            'currency' => 'EUR',
            'hero_image_url' => null,
            'summary' => null,
            'description' => null,
            'is_active' => true,
            'sort_order' => 1,
            'portfolio_featured' => false,
            'portfolio_sort_order' => 1,
            'portfolio_image_url' => null,
            'portfolio_short_description' => null,
        ]);

        TourDeparturePlace::query()->create([
            'active' => true,
            'name' => 'Budapest',
            'city' => 'Budapest',
            'fee' => null,
        ]);

        $this->createReferenceOption('country', 'hr', 'Horvátország');
        $this->createReferenceOption('program-type', 'program-type-2', 'Tengerparti program');
        $this->createReferenceOption('travel-mode', 'travel-mode-2', 'Buszos utazás');

        $tag = BlogTag::query()->create([
            'active' => true,
            'sort_order' => 1,
        ]);
        BlogTagTranslation::query()->create([
            'blog_tag_id' => $tag->id,
            'locale' => 'hu',
            'name' => 'Családi',
        ]);

        $category = BlogCategory::query()->create([
            'active' => true,
            'column' => '1',
            'seo_name' => 'klasszikus-korutazas',
            'sort_order' => 1,
        ]);
        BlogCategoryTranslation::query()->create([
            'blog_category_id' => $category->id,
            'locale' => 'hu',
            'name' => 'Klasszikus körutazás',
            'seo_name' => 'klasszikus-korutazas',
            'seo_auto_generate' => true,
        ]);
    }

    private function createReferenceOption(string $type, string $code, string $name): TourReferenceOption
    {
        return TourReferenceOption::query()->create([
            'type' => $type,
            'code' => $code,
            'name' => $name,
            'active' => true,
            'sort_order' => 1,
        ]);
    }
}
