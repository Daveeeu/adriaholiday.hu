<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\LegacyImportRecord;
use App\Models\Page;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use Illuminate\Database\Eloquent\Model;

/**
 * Legacy text boxes ("Szövegdobozok", e.g. the note under a booking form) →
 * text blocks: pages without an address, kept for the office to reuse.
 *
 * @extends RecordStep<Page>
 */
final class TextBlockStep extends RecordStep
{
    public function key(): string
    {
        return 'text-blocks';
    }

    protected function entity(): string
    {
        return LegacyImportRecord::TEXT_BLOCK;
    }

    protected function modelClass(): string
    {
        return Page::class;
    }

    protected function sources(): array
    {
        return ['text.textbox'];
    }

    protected function write(LegacyAdminExportRecord $record, ?Model $existing, LegacyAdminExport $export): ?Model
    {
        $title = $record->field('name') ?? $record->listValue('Név');

        if ($title === null) {
            return null;
        }

        $block = $existing ?? new Page(['kind' => Page::KIND_TEXT_BLOCK, 'active' => true]);
        $block->fill(['title' => $title, 'content' => $record->field('content')])->save();

        return $block;
    }
}
