<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Services\Legacy\AdminExport\LegacyAdminExportStep;
use App\Services\Legacy\LegacyBlogImporter;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportContext;
use App\Support\Legacy\AdminExport\LegacyAdminExportStepResult;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Legacy blog posts (their Hungarian texts) → blog articles, through the
 * existing legacy blog importer, which matches posts by URL name or title and
 * copies their images.
 */
final class BlogArticleStep implements LegacyAdminExportStep
{
    public function __construct(private readonly LegacyBlogImporter $importer) {}

    public function key(): string
    {
        return 'blog';
    }

    public function run(LegacyAdminExport $export, LegacyAdminExportContext $context): LegacyAdminExportStepResult
    {
        $result = new LegacyAdminExportStepResult($this->key());

        foreach ($export->records('blog.blog') as $record) {
            try {
                $outcome = DB::transaction(fn (): string => $this->importer->import([
                    'title' => $record->field('name.hu') ?? $record->listValue('Név'),
                    'long' => $record->field('long.hu'),
                    'short' => $record->field('short.hu'),
                    'seoName' => $record->field('seo_name.hu'),
                    'status' => '1',
                    'date' => $record->field('date') ?? $record->listValue('Dátum'),
                    'image' => $record->field('image'),
                    'imageTitle' => $record->field('image_title'),
                ], $context->dryRun()));
            } catch (Throwable $exception) {
                report($exception);
                $result->failed($record->legacyId(), $exception->getMessage());

                continue;
            }

            $counted = match ($outcome) {
                'invalid' => LegacyAdminExportStepResult::SKIPPED,
                'updated' => LegacyAdminExportStepResult::UPDATED,
                default => LegacyAdminExportStepResult::CREATED,
            };
            $result->count($counted);
            $context->progress($this->key(), $record->legacyId(), $counted);
        }

        return $result;
    }
}
