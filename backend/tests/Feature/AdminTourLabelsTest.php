<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\BlogCategoryTranslation;
use App\Models\BlogTag;
use App\Models\BlogTagTranslation;
use App\Models\Region;
use App\Models\Tour;
use App\Models\TourDeparturePlace;
use App\Models\TourReferenceOption;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class AdminTourLabelsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_tour_list_and_detail_return_human_readable_labels(): void
    {
        $this->actingAsTourAdmin();

        $region = Region::query()->create([
            'slug' => 'teszt-regio',
            'name' => 'Teszt régió',
            'country_code' => 'HR',
            'timezone' => 'Europe/Zagreb',
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

        $departurePlace = TourDeparturePlace::query()->create([
            'active' => true,
            'name' => 'Budapest',
            'city' => 'Budapest',
            'fee' => null,
        ]);

        $programType = $this->createReferenceOption('program-type', 'teszt-program', 'Teszt program típus');
        $travelMode = $this->createReferenceOption('travel-mode', 'teszt-busz', 'Buszos utazás');
        $countryHu = $this->createReferenceOption('country', 'hu', 'Magyarország');
        $countryHr = $this->createReferenceOption('country', 'hr', 'Horvátország');

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

        $tour = Tour::query()->create([
            'sort_order' => 1,
            'active' => true,
            'featured' => false,
            'recommended' => false,
            'xml_enabled' => true,
            'name' => 'Teszt körutazás',
            'seo_name' => 'teszt-korutazas',
            'seo_auto_generate' => false,
            'list_description' => 'Teszt list leírás',
            'short_description' => 'Teszt rövid leírás',
            'program_before' => null,
            'program' => null,
            'inclusions' => null,
            'payment_program' => null,
            'prices' => null,
            'discounts' => null,
            'notes' => null,
            'region_id' => $region->id,
            'program_type_id' => $programType->code,
            'travel_mode_id' => $travelMode->code,
            'country_ids' => [$countryHu->code, $countryHr->code],
            'tag_ids' => [(string) $tag->id],
            'category_ids' => [(string) $category->id],
            'price' => 199900,
            'slider_text' => null,
        ]);

        $tour->departurePlaces()->sync([$departurePlace->id]);

        $listResponse = $this->getJson('/api/admin/tours');
        $listResponse->assertOk();
        $listResponse->assertJsonPath('items.0.regionLabel', 'Teszt régió');
        $listResponse->assertJsonPath('items.0.programTypeLabel', 'Teszt program típus');
        $listResponse->assertJsonPath('items.0.travelModeLabel', 'Buszos utazás');
        $listResponse->assertJsonPath('items.0.countries.0.label', 'Magyarország');

        $detailResponse = $this->getJson("/api/admin/tours/{$tour->id}");
        $detailResponse->assertOk();
        $detailResponse->assertJsonPath('data.regionLabel', 'Teszt régió');
        $detailResponse->assertJsonPath('data.programTypeLabel', 'Teszt program típus');
        $detailResponse->assertJsonPath('data.travelModeLabel', 'Buszos utazás');
        $detailResponse->assertJsonPath('data.countries.0.label', 'Magyarország');
        $detailResponse->assertJsonPath('data.countries.1.label', 'Horvátország');
        $detailResponse->assertJsonPath('data.tags.0.label', 'Családi');
        $detailResponse->assertJsonPath('data.categories.0.label', 'Klasszikus körutazás');
        $detailResponse->assertJsonPath('data.departurePlaces.0.name', 'Budapest');
        $detailResponse->assertJsonFragment(['label' => 'Magyarország']);
        $detailResponse->assertJsonFragment(['label' => 'Családi']);
    }

    private function actingAsTourAdmin(): void
    {
        $permissions = [
            'tours.viewAny',
            'tours.view',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Tour Test Admin', 'web');
        $role->syncPermissions($permissions);

        $user = User::query()->create([
            'name' => 'Tour Test Admin',
            'email' => 'tour-test-admin@example.com',
            'password' => 'password',
        ]);

        $user->assignRole($role);

        Sanctum::actingAs($user);
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
