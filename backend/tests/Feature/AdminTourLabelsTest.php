<?php

namespace Tests\Feature;

use App\Models\BlogCategory;
use App\Models\BlogCategoryTranslation;
use App\Models\BlogTag;
use App\Models\BlogTagTranslation;
use App\Models\Region;
use App\Models\Tour;
use App\Models\TourDeparturePlace;
use App\Models\TourRegionGroup;
use App\Models\TourReferenceOption;
use App\Models\TourSeasonalGroup;
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

        $group = TourRegionGroup::query()->create([
            'active' => true,
            'featured_on_homepage' => false,
            'type' => 'group',
            'name' => 'Teszt csoport',
            'seo_name' => 'teszt-csoport',
            'seo_auto_generate' => false,
            'gallery_id' => null,
            'description' => null,
            'list_below_text' => null,
            'travel_conditions_link' => null,
        ]);

        $seasonalGroup = TourSeasonalGroup::query()->create([
            'active' => true,
            'menu_type' => 'intro',
            'name' => 'Teszt szezon',
            'seo_name' => 'teszt-szezon',
            'seo_auto_generate' => false,
            'box_text' => null,
            'has_offers' => true,
        ]);

        $departurePlace = TourDeparturePlace::query()->create([
            'active' => true,
            'name' => 'Budapest',
            'city' => 'Budapest',
            'fee' => null,
        ]);

        $fit = $this->createReferenceOption('fit', 'teszt-fit', 'Teszt FIT');
        $programType = $this->createReferenceOption('program-type', 'teszt-program', 'Teszt program típus');
        $travelMode = $this->createReferenceOption('travel-mode', 'teszt-busz', 'Buszos utazás');
        $difficulty = $this->createReferenceOption('difficulty', 'teszt-konnyu', 'Könnyű');
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
            'partner_offer' => false,
            'image_offer' => true,
            'xml_enabled' => true,
            'slider_image_enabled' => false,
            'slider_text_enabled' => false,
            'name' => 'Teszt körutazás',
            'seo_name' => 'teszt-korutazas',
            'seo_auto_generate' => false,
            'action1' => null,
            'action2' => null,
            'list_description' => 'Teszt list leírás',
            'short_description' => 'Teszt rövid leírás',
            'program_pdf_path' => null,
            'program_pdf_file' => null,
            'slider_image' => null,
            'program_before' => null,
            'program' => null,
            'inclusions' => null,
            'payment_program' => null,
            'prices' => null,
            'discounts' => null,
            'notes' => null,
            'region_id' => $region->id,
            'group_id' => $group->seo_name,
            'seasonal_group_id' => $seasonalGroup->seo_name,
            'fit_id' => $fit->code,
            'program_type_id' => $programType->code,
            'travel_mode_id' => $travelMode->code,
            'difficulty_id' => $difficulty->code,
            'country_ids' => [$countryHu->code, $countryHr->code],
            'tag_ids' => [(string) $tag->id],
            'category_ids' => [(string) $category->id],
            'price' => 199900,
            'displayed_price' => '199.900,-Ft -tól',
            'slider_text' => null,
        ]);

        $tour->departurePlaces()->sync([$departurePlace->id]);

        $listResponse = $this->getJson('/api/admin/tours');
        $listResponse->assertOk();
        $listResponse->assertJsonPath('items.0.regionLabel', 'Teszt régió');
        $listResponse->assertJsonPath('items.0.groupLabel', 'Teszt csoport');
        $listResponse->assertJsonPath('items.0.seasonalGroupLabel', 'Teszt szezon');
        $listResponse->assertJsonPath('items.0.fitLabel', 'Teszt FIT');
        $listResponse->assertJsonPath('items.0.programTypeLabel', 'Teszt program típus');
        $listResponse->assertJsonPath('items.0.travelModeLabel', 'Buszos utazás');
        $listResponse->assertJsonPath('items.0.difficultyLabel', 'Könnyű');
        $listResponse->assertJsonPath('items.0.countries.0.label', 'Magyarország');

        $detailResponse = $this->getJson("/api/admin/tours/{$tour->id}");
        $detailResponse->assertOk();
        $detailResponse->assertJsonPath('data.regionLabel', 'Teszt régió');
        $detailResponse->assertJsonPath('data.groupLabel', 'Teszt csoport');
        $detailResponse->assertJsonPath('data.seasonalGroupLabel', 'Teszt szezon');
        $detailResponse->assertJsonPath('data.fitLabel', 'Teszt FIT');
        $detailResponse->assertJsonPath('data.programTypeLabel', 'Teszt program típus');
        $detailResponse->assertJsonPath('data.travelModeLabel', 'Buszos utazás');
        $detailResponse->assertJsonPath('data.difficultyLabel', 'Könnyű');
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
