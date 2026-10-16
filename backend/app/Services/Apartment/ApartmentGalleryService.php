<?php

namespace App\Services\Apartment;

use App\Models\Apartment;
use App\Models\ApartmentGalleryItem;

/**
 * Saves an apartment's gallery as the admin form sends it: items it already
 * has (by id) are updated, so an imported image keeps the legacy image it
 * came from; new ones are added and the rest removed.
 */
class ApartmentGalleryService
{
    /**
     * @param  array<int, array{id?: mixed, media_id: int|string, title?: string|null, alt?: string|null, sort_order?: int|string|null, active?: bool}>  $items
     */
    public function sync(Apartment $apartment, array $items): void
    {
        $existing = $apartment->galleryItems()->get()->keyBy('id');
        $kept = [];

        foreach (array_values($items) as $index => $item) {
            $id = is_numeric($item['id'] ?? null) ? (int) $item['id'] : null;
            $galleryItem = ($id !== null ? $existing->get($id) : null) ?? new ApartmentGalleryItem(['apartment_id' => $apartment->id]);

            $galleryItem->fill([
                'media_id' => (int) $item['media_id'],
                'title' => $this->text($item['title'] ?? null),
                'alt' => $this->text($item['alt'] ?? null),
                'sort_order' => is_numeric($item['sort_order'] ?? null) ? (int) $item['sort_order'] : $index,
                'active' => (bool) ($item['active'] ?? true),
            ])->save();

            $kept[] = $galleryItem->id;
        }

        $apartment->galleryItems()->whereNotIn('id', $kept)->delete();
    }

    private function text(mixed $value): ?string
    {
        $value = is_string($value) ? trim($value) : '';

        return $value !== '' ? $value : null;
    }
}
