<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Tests\TestCase;

class TourGalleryOrderTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }

    public function test_reordered_gallery_is_saved_and_followed_by_the_admin_and_the_public_page(): void
    {
        $this->actingAsTourEditor();
        $tour = Tour::factory()->create(['active' => true, 'seo_name' => 'rendezett-galeria']);
        [$first, $second, $third] = [$this->image('first.jpg'), $this->image('second.jpg'), $this->image('third.jpg')];
        $tour->galleryItems()->create(['media_id' => $first->id, 'sort_order' => 1, 'active' => true]);
        $tour->galleryItems()->create(['media_id' => $second->id, 'sort_order' => 2, 'active' => true]);
        $tour->galleryItems()->create(['media_id' => $third->id, 'sort_order' => 3, 'active' => true]);

        $this->getJson('/api/portfolio/offers/rendezett-galeria')->assertOk();

        // The admin sends the images in their new order; a hidden one stays in the gallery.
        $this->patchJson("/api/admin/tours/{$tour->id}", $this->payload($tour, [
            ['mediaId' => (string) $third->id, 'sortOrder' => 1, 'active' => true],
            ['mediaId' => (string) $second->id, 'sortOrder' => 2, 'active' => false],
            ['mediaId' => (string) $first->id, 'sortOrder' => 3, 'active' => true],
        ]))
            ->assertOk()
            ->assertJsonCount(3, 'data.gallery')
            ->assertJsonPath('data.gallery.0.mediaId', $third->id)
            ->assertJsonPath('data.gallery.1.mediaId', $second->id)
            ->assertJsonPath('data.gallery.1.active', false)
            ->assertJsonPath('data.gallery.2.mediaId', $first->id);

        $this->assertSame(
            [$third->id, $second->id, $first->id],
            $tour->galleryItems()->pluck('media_id')->all(),
        );

        // The public page (its cache bumped by the save) shows the visible images in that order,
        // its first image as the cover.
        $this->getJson('/api/portfolio/offers/rendezett-galeria')
            ->assertOk()
            ->assertJsonCount(2, 'gallery')
            ->assertJsonPath('gallery.0.mediaId', $third->id)
            ->assertJsonPath('gallery.1.mediaId', $first->id)
            ->assertJsonPath('image.id', $third->id);
    }

    public function test_sort_order_is_renumbered_from_one_in_the_order_it_gives(): void
    {
        $this->actingAsTourEditor();
        $tour = Tour::factory()->create();
        [$first, $second] = [$this->image('first.jpg'), $this->image('second.jpg')];

        $this->patchJson("/api/admin/tours/{$tour->id}", $this->payload($tour, [
            ['mediaId' => (string) $first->id, 'sortOrder' => 20, 'active' => true],
            ['mediaId' => (string) $second->id, 'sortOrder' => 5, 'active' => true],
        ]))->assertOk();

        $this->assertSame(
            [[$second->id, 1], [$first->id, 2]],
            $tour->galleryItems()->get()->map(fn ($item): array => [$item->media_id, $item->sort_order])->all(),
        );
    }

    private function image(string $fileName): Media
    {
        return Tour::factory()->create()
            ->addMediaFromString('image-bytes')
            ->usingFileName($fileName)
            ->toMediaCollection('slider');
    }

    /**
     * @param  list<array<string, mixed>>  $gallery
     * @return array<string, mixed>
     */
    private function payload(Tour $tour, array $gallery): array
    {
        return [
            'active' => true,
            'name' => $tour->name,
            'seo_name' => $tour->seo_name,
            'seo_auto_generate' => false,
            'gallery' => $gallery,
        ];
    }

    private function actingAsTourEditor(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate('tours.update', 'web'));

        Sanctum::actingAs($user);
    }
}
