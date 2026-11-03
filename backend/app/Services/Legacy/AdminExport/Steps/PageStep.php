<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\LegacyImportRecord;
use App\Models\Page;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportRecord;
use Illuminate\Database\Eloquent\Model;

/**
 * Legacy text pages ("Szöveges oldalak") → pages at their legacy address.
 * Imported switched off: many are expired game rules or sidebar texts, so
 * the office decides which go live.
 *
 * @extends RecordStep<Page>
 */
final class PageStep extends RecordStep
{
    public function key(): string
    {
        return 'pages';
    }

    protected function entity(): string
    {
        return LegacyImportRecord::PAGE;
    }

    protected function modelClass(): string
    {
        return Page::class;
    }

    protected function sources(): array
    {
        return ['text.flatpage'];
    }

    protected function write(LegacyAdminExportRecord $record, ?Model $existing, LegacyAdminExport $export): ?Model
    {
        $title = $record->field('name') ?? $record->listValue('Név');

        if ($title === null) {
            return null;
        }

        $slug = $record->field('seo_name');
        $page = $existing ?? ($slug !== null ? Page::withTrashed()->where('slug', $slug)->first() : null) ?? new Page(['kind' => Page::KIND_PAGE, 'active' => false]);
        $this->fillFromLegacy($page, [
            'title' => $title,
            'slug' => $slug,
            'content' => $record->field('content'),
            'seo_title' => $record->field('seo.title'),
            'seo_description' => $record->field('seo.description'),
            'seo_robots' => $record->field('seo.robots'),
        ], $existing !== null);
        $page->save();

        return $page;
    }
}
