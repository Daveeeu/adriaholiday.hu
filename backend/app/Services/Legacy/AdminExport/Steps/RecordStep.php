<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Services\Legacy\AdminExport\LegacyAdminExportStep;
use App\Services\Legacy\AdminExport\LegacyRecordRegistry;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportContext;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use App\Support\Legacy\AdminExport\LegacyAdminExportStepResult;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * A step that turns each record of legacy entities into one local model,
 * remembered in legacy_import_records: unchanged records are skipped, changed
 * ones update the model they became, a failed record never stops the others.
 *
 * @template TModel of Model
 */
abstract class RecordStep implements LegacyAdminExportStep
{
    private ?LegacyAdminExportContext $context = null;

    public function __construct(protected readonly LegacyRecordRegistry $registry) {}

    /**
     * The legacy_import_records entity the step's records are kept as.
     */
    abstract protected function entity(): string;

    /**
     * @return class-string<TModel>
     */
    abstract protected function modelClass(): string;

    /**
     * The export entities the step reads, e.g. ["management.message"].
     *
     * @return array<int, string>
     */
    abstract protected function sources(): array;

    /**
     * Writes the record into the model it became before (or a new one) and
     * returns it saved; null when the record holds nothing to import.
     *
     * @param  TModel|null  $existing
     * @return TModel|null
     */
    abstract protected function write(LegacyAdminExportRecord $record, ?Model $existing, LegacyAdminExport $export): ?Model;

    public function run(LegacyAdminExport $export, LegacyAdminExportContext $context): LegacyAdminExportStepResult
    {
        $result = new LegacyAdminExportStepResult($this->key());
        $this->context = $context;

        foreach ($this->sources() as $source) {
            foreach ($export->records($source) as $record) {
                $this->handle($record, $export, $context, $result);
            }
        }

        return $result;
    }

    /**
     * Whether the run copies legacy images (not with --media=none).
     */
    protected function copiesMedia(): bool
    {
        return $this->context?->mediaMode !== LegacyAdminExportContext::MEDIA_NONE;
    }

    /**
     * Writes the legacy values into a model: all of them into one the import
     * made, only the blank ones into one the office made (adopted by its
     * natural key), so the import never overwrites the office's work.
     *
     * @param  array<string, mixed>  $values
     */
    protected function fillFromLegacy(Model $model, array $values, bool $importedBefore): void
    {
        if ($importedBefore || ! $model->exists) {
            $model->fill($values);

            return;
        }

        foreach ($values as $attribute => $value) {
            $current = $model->getAttribute($attribute);

            if ($current === null || $current === '') {
                $model->setAttribute($attribute, $value);
            }
        }
    }

    /**
     * @return TModel|null
     */
    protected function existing(int $legacyId): ?Model
    {
        return $this->registry->find($this->entity(), $legacyId, $this->modelClass());
    }

    private function handle(LegacyAdminExportRecord $record, LegacyAdminExport $export, LegacyAdminExportContext $context, LegacyAdminExportStepResult $result): void
    {
        $legacyId = $record->legacyId();

        if ($legacyId === null) {
            $result->count(LegacyAdminExportStepResult::SKIPPED);

            return;
        }

        $payload = $record->payload();
        $existing = $this->existing($legacyId);

        if ($existing !== null && $this->registry->unchanged($this->entity(), $legacyId, $payload)) {
            $result->count(LegacyAdminExportStepResult::UNCHANGED);

            return;
        }

        $outcome = $existing !== null ? LegacyAdminExportStepResult::UPDATED : LegacyAdminExportStepResult::CREATED;

        if ($context->dryRun()) {
            $result->count($outcome);
            $context->progress($this->key(), $legacyId, $outcome);

            return;
        }

        try {
            $model = DB::transaction(function () use ($record, $existing, $export, $legacyId, $payload, $context): ?Model {
                $model = $this->write($record, $existing, $export);

                if ($model !== null) {
                    $this->registry->remember($this->entity(), $legacyId, $model, $payload, $context->run);
                }

                return $model;
            });
        } catch (Throwable $exception) {
            report($exception);
            $this->registry->fail($this->entity(), $legacyId, $payload, $context->run, $exception->getMessage());
            $result->failed($legacyId, $exception->getMessage());
            $context->progress($this->key(), $legacyId, LegacyAdminExportStepResult::FAILED);

            return;
        }

        $outcome = $model === null ? LegacyAdminExportStepResult::SKIPPED : $outcome;
        $result->count($outcome);
        $context->progress($this->key(), $legacyId, $outcome);
    }
}
