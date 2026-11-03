<?php

namespace App\Services\Legacy\AdminExport;

use App\Models\LegacyImportRecord;
use App\Models\LegacyImportRun;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Which local record each legacy record became, through legacy_import_records:
 * a re-run updates the same record, skips the ones whose legacy data did not
 * change, and keeps the legacy JSON word for word.
 */
final class LegacyRecordRegistry
{
    /**
     * The local record a legacy record became, soft-deleted ones included (an
     * archived record stays archived instead of coming back as a duplicate).
     *
     * @template TModel of Model
     *
     * @param  class-string<TModel>  $class
     * @return TModel|null
     */
    public function find(string $entity, int $legacyId, string $class): ?Model
    {
        $localId = LegacyImportRecord::query()
            ->where('entity', $entity)
            ->where('legacy_id', $legacyId)
            ->where('local_type', $class)
            ->value('local_id');

        if ($localId === null) {
            return null;
        }

        $query = $class::query();

        if (in_array(SoftDeletes::class, class_uses_recursive($class), true)) {
            $query->withTrashed();
        }

        return $query->find($localId);
    }

    /**
     * Whether the legacy record was imported before from exactly this data.
     *
     * @param  array<string, mixed>  $payload
     */
    public function unchanged(string $entity, int $legacyId, array $payload): bool
    {
        return LegacyImportRecord::query()
            ->where('entity', $entity)
            ->where('legacy_id', $legacyId)
            ->where('status', LegacyImportRecord::IMPORTED)
            ->where('payload_sha256', LegacyImportRecord::hashPayload($payload))
            ->exists();
    }

    /**
     * @param  array<string, mixed>  $payload
     * @param  array<int, string>  $messages
     */
    public function remember(string $entity, int $legacyId, Model $local, array $payload, LegacyImportRun $run, array $messages = []): void
    {
        LegacyImportRecord::query()->updateOrCreate(
            ['entity' => $entity, 'legacy_id' => $legacyId],
            [
                'local_type' => $local::class,
                'local_id' => $local->getKey(),
                'legacy_import_run_id' => $run->id,
                'payload_sha256' => LegacyImportRecord::hashPayload($payload),
                'raw_payload' => LegacyImportRecord::encodePayload($payload),
                'status' => LegacyImportRecord::IMPORTED,
                'messages' => $messages === [] ? null : $messages,
            ],
        );
    }

    /**
     * Records the failure; a record imported before keeps its status and link.
     *
     * @param  array<string, mixed>  $payload
     */
    public function fail(string $entity, int $legacyId, array $payload, LegacyImportRun $run, string $message): void
    {
        $record = LegacyImportRecord::query()->firstOrNew(['entity' => $entity, 'legacy_id' => $legacyId]);
        $message = Str::limit($message, 1000);

        if ($record->exists && $record->status === LegacyImportRecord::IMPORTED) {
            $record->update(['messages' => [...($record->messages ?? []), "Run {$run->id}: {$message}"]]);

            return;
        }

        $record->fill([
            'legacy_import_run_id' => $run->id,
            'payload_sha256' => LegacyImportRecord::hashPayload($payload),
            'raw_payload' => LegacyImportRecord::encodePayload($payload),
            'status' => LegacyImportRecord::FAILED,
            'messages' => [$message],
        ])->save();
    }
}
