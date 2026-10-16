<?php

namespace Tests\Feature;

use App\Models\AdminMediaItem;
use App\Models\Apartment;
use App\Models\ApartmentGalleryItem;
use App\Models\ApartmentType;
use App\Models\Location;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Laravel\Sanctum\Sanctum;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class ApartmentAdminTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
        ApartmentType::query()->create(['slug' => 'italian', 'name' => 'Olasz apartmanok', 'is_active' => true]);
        $this->actingAsApartmentAdmin();
    }

    public function test_an_imported_apartment_is_edited_with_its_distances_seo_and_gallery(): void
    {
        $apartment = Apartment::factory()->create(['type' => 'italian', 'code' => '768-A', 'gallery_id' => null, 'legacy_id' => 498]);
        $imported = ApartmentGalleryItem::query()->create(['apartment_id' => $apartment->id, 'media_id' => $this->media()->id, 'legacy_image_id' => 30099, 'sort_order' => 0]);
        $removed = ApartmentGalleryItem::query()->create(['apartment_id' => $apartment->id, 'media_id' => $this->media()->id, 'sort_order' => 1]);
        $added = $this->media();

        $this->patchJson("/api/admin/apartments/{$apartment->id}", [
            ...$this->formPayload($apartment),
            // Apartments of one building share a code.
            'code' => '768',
            'distanceToCenterM' => 50,
            'distanceToSeaM' => 300,
            'seoTitle' => '3C apartman Bibione',
            'seoDescription' => 'Apartman Bibionéban, 300 m-re a tengertől.',
            'seoRobots' => 'noindex, follow',
            'shortDescription' => '',
            'gallery' => [
                ['mediaId' => $added->id, 'alt' => 'Terasz', 'sortOrder' => 0],
                ['id' => $imported->id, 'mediaId' => $imported->media_id, 'sortOrder' => 1],
            ],
        ])->assertOk()
            ->assertJsonPath('data.legacyId', 498)
            ->assertJsonPath('data.distanceToSeaM', 300)
            ->assertJsonPath('data.seoTitle', '3C apartman Bibione')
            ->assertJsonPath('data.galleryItems.0.mediaId', $added->id)
            ->assertJsonPath('data.galleryItems.1.legacyImageId', 30099);

        Apartment::factory()->create(['type' => 'italian', 'code' => '768']);

        $apartment->refresh();
        $this->assertSame('768', $apartment->code);
        $this->assertSame('', $apartment->short_description);
        $this->assertNull(ApartmentGalleryItem::query()->find($removed->id));
        $this->assertSame(30099, $imported->refresh()->legacy_image_id);
        $this->assertSame(1, $imported->sort_order);
    }

    public function test_a_form_without_the_gallery_leaves_the_gallery_alone(): void
    {
        $apartment = Apartment::factory()->create(['type' => 'italian', 'gallery_id' => null]);
        ApartmentGalleryItem::query()->create(['apartment_id' => $apartment->id, 'media_id' => $this->media()->id]);

        $this->patchJson("/api/admin/apartments/{$apartment->id}", $this->formPayload($apartment))->assertOk();

        $this->assertSame(1, $apartment->galleryItems()->count());
    }

    public function test_a_location_is_edited_with_its_apartment_page_texts(): void
    {
        $location = Location::factory()->create(['slug' => 'bibione', 'guide' => '<p>Régi</p>']);
        $payload = [
            'regionId' => $location->region_id,
            'slug' => 'bibione',
            'name' => 'Bibione',
            'type' => 'coastal_town',
            'latitude' => 45.63,
            'longitude' => 13.06,
            'transferMinutesFromAirport' => 60,
        ];

        // A form without the apartment page fields leaves them alone.
        $this->patchJson("/api/admin/locations/{$location->id}", $payload)->assertOk()->assertJsonPath('data.guide', '<p>Régi</p>');

        $this->patchJson("/api/admin/locations/{$location->id}", [
            ...$payload,
            'areaSlug' => 'veneto',
            'areaName' => 'Veneto',
            'guide' => '<h2 id="strand_bibione">Strand</h2><script>alert(1)</script>',
            'apartmentInformation' => '<p>Információk</p>',
            'seoTitle' => 'Bibione apartman',
        ])->assertOk()
            ->assertJsonPath('data.areaSlug', 'veneto')
            ->assertJsonPath('data.guide', '<h2 id="strand_bibione">Strand</h2>')
            ->assertJsonPath('data.seoTitle', 'Bibione apartman');

        $this->patchJson("/api/admin/locations/{$location->id}", [...$payload, 'areaSlug' => 'Veneto régió'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('area_slug');
    }

    /**
     * @return array<string, mixed>
     */
    private function formPayload(Apartment $apartment): array
    {
        return [
            'name' => $apartment->name,
            'slug' => $apartment->slug,
            'type' => 'italian',
            'regionId' => $apartment->region_id,
            'locationId' => $apartment->location_id,
            'galleryId' => null,
            'stars' => 3,
            'bedrooms' => 0,
            'bathrooms' => 0,
            'maxGuests' => 6,
            'sizeM2' => 0,
            'address' => 'Via Cigno 37, Bibione',
            'shortDescription' => '<p>Rövid</p>',
            'status' => 'published',
        ];
    }

    private function media(): Media
    {
        return AdminMediaItem::create()
            ->addMedia(UploadedFile::fake()->image('kep.jpg', 20, 20))
            ->toMediaCollection('library');
    }

    private function actingAsApartmentAdmin(): void
    {
        $permissions = ['apartments.viewAny', 'apartments.view', 'apartments.create', 'apartments.update', 'apartments.delete', 'apartments.status', 'locations.view', 'locations.update'];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Apartment Test Admin', 'web');
        $role->syncPermissions($permissions);

        $user = User::query()->create(['name' => 'Apartment Test Admin', 'email' => 'apartment-test-admin@example.com', 'password' => 'password']);
        $user->assignRole($role);

        Sanctum::actingAs($user);
    }
}
