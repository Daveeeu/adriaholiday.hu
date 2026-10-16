<?php

namespace App\Support\Legacy\Apartments;

/**
 * One legacy apartment as the new site stores it: the apartment's
 * attributes, the legacy place it belongs to and its gallery images.
 */
final readonly class LegacyApartmentData
{
    /**
     * @param  array<string, mixed>  $attributes  of the Apartment, without region and location
     * @param  list<array{legacy_image_id: int|null, url: string, title: string|null}>  $images  in gallery order
     * @param  list<string>  $warnings
     */
    public function __construct(
        public int $legacyId,
        public string $list,
        public ?int $placeId,
        public bool $listed,
        public array $attributes,
        public array $images,
        public array $warnings,
    ) {}
}
