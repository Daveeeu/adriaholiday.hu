<?php

namespace App\Services\Legacy\Apartments;

use App\Support\Legacy\Apartments\LegacyApartmentExport;
use App\Support\Legacy\Apartments\LegacyApartmentExportException;
use JsonException;

/**
 * Reads the legacy apartment export file, without changing it.
 */
final class LegacyApartmentExportReader
{
    /**
     * @throws LegacyApartmentExportException
     */
    public function read(string $path): LegacyApartmentExport
    {
        if (! is_file($path) || ! is_readable($path)) {
            throw new LegacyApartmentExportException("The legacy apartment export cannot be read: {$path}");
        }

        $contents = (string) file_get_contents($path);

        try {
            $data = json_decode($contents, true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new LegacyApartmentExportException("The legacy apartment export is not valid JSON: {$exception->getMessage()}", previous: $exception);
        }

        foreach (['apartments', 'places', 'regions'] as $list) {
            if (! is_array($data) || ! array_is_list($data[$list] ?? null)) {
                throw new LegacyApartmentExportException("The legacy apartment export has no \"{$list}\" list.");
            }
        }

        if (! is_array($data['galleries'] ?? null) || ! is_array($data['listing']['listed_seo_names'] ?? null)) {
            throw new LegacyApartmentExportException('The legacy apartment export has no galleries or no listing.');
        }

        return new LegacyApartmentExport(
            path: $path,
            sha256: hash('sha256', $contents),
            generatedAt: is_string($data['generated_at'] ?? null) ? $data['generated_at'] : null,
            apartments: array_values(array_filter($data['apartments'], 'is_array')),
            places: $this->byId($data['places']),
            regions: $this->byId($data['regions']),
            galleries: collect($data['galleries'])
                ->filter(fn (mixed $images): bool => is_array($images))
                ->mapWithKeys(fn (array $images, int|string $id): array => [(int) $id => array_values(array_filter($images, 'is_array'))])
                ->all(),
            listedSeoNames: array_values(array_filter($data['listing']['listed_seo_names'], 'is_string')),
        );
    }

    /**
     * @param  list<mixed>  $records
     * @return array<int, array<string, mixed>>
     */
    private function byId(array $records): array
    {
        return collect($records)
            ->filter(fn (mixed $record): bool => is_array($record) && is_numeric($record['id'] ?? null))
            ->keyBy(fn (array $record): int => (int) $record['id'])
            ->all();
    }
}
