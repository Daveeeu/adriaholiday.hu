<?php

namespace App\Support\Legacy\AdminExport;

/**
 * The full export of the legacy adriaholiday.hu admin (every list, every edit
 * form and the related lists the forms load), read as is.
 *
 * Entities are keyed "module.list" as the export names them, e.g.
 * "management.reservation", "roundtrip.offer", "users.user".
 */
final class LegacyAdminExport
{
    /**
     * @var array<string, array<int, LegacyAdminExportRecord>>
     */
    private array $byId = [];

    /**
     * @param  array<string, array<int, array<string, mixed>>>  $entities  records keyed by entity
     * @param  array<string, array<string, mixed>>  $relations  related lists keyed by name, then by legacy owner id
     */
    public function __construct(
        public readonly string $path,
        public readonly string $sha256,
        public readonly ?string $exportedAt,
        public readonly string $baseUrl,
        private readonly array $entities,
        private readonly array $relations,
    ) {}

    public function has(string $entity): bool
    {
        return isset($this->entities[$entity]);
    }

    /**
     * @return array<int, LegacyAdminExportRecord>
     */
    public function records(string $entity): array
    {
        return array_map(fn (array $raw): LegacyAdminExportRecord => new LegacyAdminExportRecord($raw), $this->entities[$entity] ?? []);
    }

    /**
     * @return array<int, LegacyAdminExportRecord> keyed by legacy id
     */
    public function recordsById(string $entity): array
    {
        return $this->byId[$entity] ??= collect($this->records($entity))
            ->filter(fn (LegacyAdminExportRecord $record): bool => $record->legacyId() !== null)
            ->keyBy(fn (LegacyAdminExportRecord $record): int => (int) $record->legacyId())
            ->all();
    }

    public function record(string $entity, ?int $legacyId): ?LegacyAdminExportRecord
    {
        return $legacyId === null ? null : ($this->recordsById($entity)[$legacyId] ?? null);
    }

    /**
     * @return array<int|string, mixed> the related list of one legacy owner
     */
    public function relation(string $name, int $ownerId): array
    {
        $value = $this->relations[$name][(string) $ownerId] ?? [];

        return is_array($value) ? $value : [];
    }

    /**
     * The absolute legacy URL of a path the export holds ("uploads/…", "files/…").
     */
    public function fileUrl(?string $path): ?string
    {
        $path = trim((string) $path);

        if ($path === '') {
            return null;
        }

        if (preg_match('~^https?://~i', $path)) {
            return $path;
        }

        return rtrim($this->baseUrl, '/').'/'.ltrim($path, '/');
    }
}
