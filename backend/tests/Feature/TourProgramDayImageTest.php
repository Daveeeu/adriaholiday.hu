<?php

namespace Tests\Feature;

use App\Models\Tour;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Tests\TestCase;

class TourProgramDayImageTest extends TestCase
{
    use RefreshDatabase;

    private function galleryImage(Tour $tour, string $fileName, int $sortOrder, bool $active = true): Media
    {
        $media = Tour::factory()->create()
            ->addMediaFromString('image-bytes')
            ->usingFileName($fileName)
            ->toMediaCollection('slider');
        $tour->galleryItems()->create(['media_id' => $media->id, 'sort_order' => $sortOrder, 'active' => $active]);

        return $media;
    }

    private function programDay(Tour $tour, int $dayNumber, array $attributes = []): void
    {
        $tour->programDays()->create([
            'sort_order' => $dayNumber,
            'day_number' => $dayNumber,
            'title' => $dayNumber.'. nap',
            'active' => true,
            ...$attributes,
        ]);
    }

    public function test_days_without_an_image_get_the_tours_gallery_images_in_turn(): void
    {
        $tour = Tour::factory()->create(['active' => true, 'seo_name' => 'programos-ut']);
        $this->galleryImage($tour, 'main.jpg', 1);
        $this->galleryImage($tour, 'hidden.jpg', 2, active: false);
        $second = $this->galleryImage($tour, 'second.jpg', 3);
        $third = $this->galleryImage($tour, 'third.jpg', 4);
        $this->programDay($tour, 1);
        $this->programDay($tour, 2, ['image' => 'https://example.com/own.jpg']);
        $this->programDay($tour, 3, ['active' => false]);
        $this->programDay($tour, 4);
        $this->programDay($tour, 5);

        $this->getJson('/api/portfolio/offers/programos-ut')
            ->assertOk()
            ->assertJsonPath('programDays.0.image', $second->getUrl())
            ->assertJsonPath('programDays.1.image', 'https://example.com/own.jpg')
            ->assertJsonPath('programDays.2.image', null)
            ->assertJsonPath('programDays.3.image', $second->getUrl())
            ->assertJsonPath('programDays.4.image', $third->getUrl());
    }

    public function test_main_image_is_used_when_it_is_the_only_gallery_image(): void
    {
        $tour = Tour::factory()->create(['active' => true, 'seo_name' => 'egykepes-ut']);
        $only = $this->galleryImage($tour, 'only.jpg', 1);
        $this->programDay($tour, 1);

        $this->getJson('/api/portfolio/offers/egykepes-ut')
            ->assertOk()
            ->assertJsonPath('programDays.0.image', $only->getUrl());
    }

    public function test_days_stay_without_an_image_when_the_tour_has_no_gallery(): void
    {
        $tour = Tour::factory()->create(['active' => true, 'seo_name' => 'kep-nelkuli-ut']);
        $this->programDay($tour, 1);

        $this->getJson('/api/portfolio/offers/kep-nelkuli-ut')
            ->assertOk()
            ->assertJsonPath('programDays.0.image', null);
    }
}
