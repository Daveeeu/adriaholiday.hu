<?php

namespace App\Support\Legacy\Catalog;

/**
 * The legacy offer catalog exported from the old adriaholiday.hu admin
 * (legacy-export/adriaholiday-all-offers.json), read as is.
 */
final readonly class LegacyCatalog
{
    /**
     * @param  array<string, mixed>  $reference  offer_groups, regions and boarding_points of the legacy admin
     * @param  array<int, array<string, mixed>>  $offers
     */
    public function __construct(
        public string $path,
        public string $sha256,
        public ?string $generatedAt,
        public ?int $declaredCount,
        public array $reference,
        public array $offers,
    ) {}

    /**
     * @return array<int, array<string, mixed>> the legacy boarding points keyed by legacy id
     */
    public function boardingPoints(): array
    {
        return collect($this->reference['boarding_points'] ?? [])
            ->filter(fn (mixed $point): bool => is_array($point) && is_numeric($point['id'] ?? null))
            ->keyBy(fn (array $point): int => (int) $point['id'])
            ->all();
    }
}
