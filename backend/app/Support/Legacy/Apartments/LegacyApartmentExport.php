<?php

namespace App\Support\Legacy\Apartments;

/**
 * The legacy apartment export: every apartment the legacy admin keeps active
 * with its edit form's values, the gallery images, places and regions they
 * refer to, and which of them the legacy site's location lists showed.
 */
final readonly class LegacyApartmentExport
{
    /**
     * @param  list<array<string, mixed>>  $apartments
     * @param  array<int, array<string, mixed>>  $places  by legacy place id
     * @param  array<int, array<string, mixed>>  $regions  by legacy region id
     * @param  array<int, list<array<string, mixed>>>  $galleries  images by legacy gallery id
     * @param  list<string>  $listedSeoNames  URL names of the apartments the legacy lists showed
     */
    public function __construct(
        public string $path,
        public string $sha256,
        public ?string $generatedAt,
        public array $apartments,
        public array $places,
        public array $regions,
        public array $galleries,
        public array $listedSeoNames,
    ) {}

    /**
     * @return array<string, mixed>|null
     */
    public function place(?int $id): ?array
    {
        return $id !== null ? ($this->places[$id] ?? null) : null;
    }

    /**
     * @return array<string, mixed>|null
     */
    public function region(?int $id): ?array
    {
        return $id !== null ? ($this->regions[$id] ?? null) : null;
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function galleryImages(?int $id): array
    {
        return $id !== null ? ($this->galleries[$id] ?? []) : [];
    }
}
