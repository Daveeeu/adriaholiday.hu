<?php

namespace Database\Seeders;

use App\Models\Gallery;
use App\Models\Location;
use Database\Seeders\Concerns\CreatesPlaceholderMedia;
use App\Support\MediaCategory;
use Illuminate\Database\Seeder;

class GallerySeeder extends Seeder
{
    use CreatesPlaceholderMedia;

    public function run(): void
    {
        $locations = Location::query()->orderBy('id')->get()->values();

        foreach ($locations as $index => $location) {
            $gallery = Gallery::query()->updateOrCreate(
                [
                    'region_id' => $location->region_id,
                    'title' => "{$location->name} apartman galéria",
                ],
                [
                    'category' => 'apartment',
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ],
            );

            $gallery->clearMediaCollection('gallery');
            $this->attachPlaceholderMedia($gallery, 'gallery', $location->name, [
                'category' => MediaCategory::GALLERIES->value,
                'source_context' => 'gallery',
                'source_id' => $gallery->id,
                'alt' => $location->name,
                'title' => $location->name,
            ]);
        }
    }
}
