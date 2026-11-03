<?php

namespace App\Services\Legacy\AdminExport\Steps;

use App\Models\SeoRedirect;
use App\Services\Legacy\AdminExport\LegacyAdminExportStep;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportContext;
use App\Support\Legacy\AdminExport\LegacyAdminExportStepResult;
use Illuminate\Support\Collection;

/**
 * The legacy site's redirect list → SEO redirects. The list repeats most of
 * its rows, so each old address is kept once (its last target wins, as on the
 * legacy site); targets on the legacy domain become site paths, which the
 * legacy route rules then lead to their new address. Redirects the office
 * made by hand are never overwritten.
 */
final class SeoRedirectStep implements LegacyAdminExportStep
{
    private const CHUNK = 1000;

    private const MAX_PATH_LENGTH = 512;

    private const MAX_TARGET_LENGTH = 1024;

    public function key(): string
    {
        return 'seo-redirects';
    }

    public function run(LegacyAdminExport $export, LegacyAdminExportContext $context): LegacyAdminExportStepResult
    {
        $result = new LegacyAdminExportStepResult($this->key());
        $redirects = $this->redirects($export, $result);
        $manual = SeoRedirect::query()->where('origin', SeoRedirect::ORIGIN_MANUAL)->pluck('source_path')->flip();
        $known = SeoRedirect::query()->where('origin', SeoRedirect::ORIGIN_LEGACY)->pluck('target', 'source_path');

        $rows = $redirects
            ->reject(fn (string $target, string $source): bool => $manual->has($source))
            ->map(fn (string $target, string $source): array => ['source_path' => $source, 'target' => $target]);

        $result->count(LegacyAdminExportStepResult::SKIPPED, $redirects->count() - $rows->count());

        foreach ($rows as $row) {
            $result->count(match ($known->get($row['source_path'])) {
                null => LegacyAdminExportStepResult::CREATED,
                $row['target'] => LegacyAdminExportStepResult::UNCHANGED,
                default => LegacyAdminExportStepResult::UPDATED,
            });
        }

        if ($context->dryRun()) {
            return $result;
        }

        $now = now();

        foreach ($rows->values()->chunk(self::CHUNK) as $chunk) {
            SeoRedirect::query()->upsert(
                $chunk->map(fn (array $row): array => [
                    ...$row,
                    'active' => true,
                    'origin' => SeoRedirect::ORIGIN_LEGACY,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])->all(),
                ['source_path'],
                ['target', 'updated_at'],
            );
        }

        return $result;
    }

    /**
     * @return Collection<string, string> target keyed by normalized source path
     */
    private function redirects(LegacyAdminExport $export, LegacyAdminExportStepResult $result): Collection
    {
        $redirects = collect();

        foreach ($export->records('redirect.redirect') as $record) {
            $source = SeoRedirect::normalizePath((string) $record->listValue('Honnan'));
            $target = $this->target((string) $record->listValue('Hova'));

            if ($source === '' || $target === null || mb_strlen($source) > self::MAX_PATH_LENGTH || mb_strlen($target) > self::MAX_TARGET_LENGTH || $target === '/'.$source) {
                $result->count(LegacyAdminExportStepResult::SKIPPED);

                continue;
            }

            $redirects->put($source, $target);
        }

        return $redirects;
    }

    private function target(string $target): ?string
    {
        $target = trim($target);

        if ($target === '') {
            return null;
        }

        if (preg_match('~^(?:https?:)?//(?:www\.)?adriaholiday\.hu(/.*)?$~i', $target, $match)) {
            return '/'.ltrim($match[1] ?? '', '/');
        }

        return preg_match('~^https?://~i', $target) ? $target : '/'.ltrim($target, '/');
    }
}
