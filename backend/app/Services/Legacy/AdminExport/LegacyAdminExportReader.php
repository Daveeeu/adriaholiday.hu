<?php

namespace App\Services\Legacy\AdminExport;

use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportException;
use JsonException;

/**
 * Reads the full legacy admin export (adriaholiday_export_*.json), without
 * changing it.
 */
final class LegacyAdminExportReader
{
    /**
     * @throws LegacyAdminExportException
     */
    public function read(string $path): LegacyAdminExport
    {
        if (! is_file($path) || ! is_readable($path)) {
            throw new LegacyAdminExportException("The legacy admin export cannot be read: {$path}");
        }

        $contents = (string) file_get_contents($path);

        try {
            $data = json_decode($contents, true, flags: JSON_THROW_ON_ERROR);
        } catch (JsonException $exception) {
            throw new LegacyAdminExportException("The legacy admin export is not valid JSON: {$exception->getMessage()}", previous: $exception);
        }

        if (! is_array($data) || ! is_array($data['meta'] ?? null) || ! is_array($data['entities'] ?? null)) {
            throw new LegacyAdminExportException('The file is not a legacy admin export: it has no "meta" and "entities".');
        }

        $entities = [];

        foreach ($data['entities'] as $name => $entity) {
            if (! is_array($entity) || ! array_is_list($entity['records'] ?? null)) {
                throw new LegacyAdminExportException("The entity \"{$name}\" has no records list.");
            }

            $entities[(string) $name] = array_values(array_filter($entity['records'], 'is_array'));
        }

        return new LegacyAdminExport(
            path: $path,
            sha256: hash('sha256', $contents),
            exportedAt: is_string($data['meta']['exported_at'] ?? null) ? $data['meta']['exported_at'] : null,
            baseUrl: is_string($data['meta']['base_url_for_files'] ?? null) ? $data['meta']['base_url_for_files'] : (string) config('services.legacy_adria.base_url'),
            entities: $entities,
            relations: array_filter(is_array($data['relations'] ?? null) ? $data['relations'] : [], 'is_array'),
        );
    }
}
