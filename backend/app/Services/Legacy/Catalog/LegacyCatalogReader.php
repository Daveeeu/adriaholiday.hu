<?php

namespace App\Services\Legacy\Catalog;

use App\Support\Legacy\Catalog\LegacyCatalog;
use App\Support\Legacy\Catalog\LegacyCatalogException;
use JsonException;

/**
 * Reads the legacy catalog export file, without changing it.
 */
final class LegacyCatalogReader
{
    /**
     * @throws LegacyCatalogException
     */
    public function read(string $path): LegacyCatalog
    {
        if (! is_file($path) || ! is_readable($path)) {
            throw new LegacyCatalogException("The legacy catalog file cannot be read: {$path}");
        }

        $contents = (string) file_get_contents($path);

        try {
            $data = json_decode($contents, true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new LegacyCatalogException("The legacy catalog file is not valid JSON: {$exception->getMessage()}", previous: $exception);
        }

        if (! is_array($data) || ! array_is_list($data['offers'] ?? null)) {
            throw new LegacyCatalogException('The legacy catalog file has no "offers" list.');
        }

        return new LegacyCatalog(
            path: $path,
            sha256: hash('sha256', $contents),
            generatedAt: is_string($data['generated_at'] ?? null) ? $data['generated_at'] : null,
            declaredCount: is_int($data['count'] ?? null) ? $data['count'] : null,
            reference: is_array($data['reference'] ?? null) ? $data['reference'] : [],
            offers: $data['offers'],
        );
    }
}
