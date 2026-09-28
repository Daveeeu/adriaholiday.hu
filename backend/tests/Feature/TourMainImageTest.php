<?php

namespace Tests\Feature;

use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Tests\TestCase;

class TourMainImageTest extends TestCase
{
    use RefreshDatabase;

    private function imageOf(Tour $holder, string $fileName): Media
    {
        return $holder->addMediaFromString('image-bytes')->usingFileName($fileName)->toMediaCollection('slider');
    }

    public function test_tour_without_slider_image_uses_its_first_active_gallery_image(): void
    {
        $tour = Tour::factory()->create(['active' => true, 'seo_name' => 'galeria-kepes-ut']);
        $holder = Tour::factory()->create();
        $hidden = $this->imageOf($holder, 'hidden.jpg');
        $first = $this->imageOf($holder, 'first.jpg');
        $tour->galleryItems()->create(['media_id' => $hidden->id, 'sort_order' => 1, 'active' => false]);
        $tour->galleryItems()->create(['media_id' => $first->id, 'sort_order' => 2, 'active' => true]);

        $this->getJson('/api/portfolio/offers/galeria-kepes-ut')
            ->assertOk()
            ->assertJsonPath('image.id', $first->id);

        $this->assertSame($first->id, $tour->fresh()->mainImage()?->id);
    }

    public function test_dedicated_slider_image_takes_precedence_over_the_gallery(): void
    {
        $tour = Tour::factory()->create(['active' => true, 'seo_name' => 'slider-kepes-ut']);
        $slider = $this->imageOf($tour, 'slider.jpg');
        $gallery = $this->imageOf(Tour::factory()->create(), 'gallery.jpg');
        $tour->galleryItems()->create(['media_id' => $gallery->id, 'sort_order' => 1, 'active' => true]);

        $this->getJson('/api/portfolio/offers/slider-kepes-ut')
            ->assertOk()
            ->assertJsonPath('image.id', $slider->id);
    }
}
