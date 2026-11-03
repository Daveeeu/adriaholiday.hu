<?php

namespace App\Services\Legacy\AdminExport;

use App\Models\LegacyImportRun;
use App\Services\Legacy\AdminExport\Steps\ApartmentBookingStep;
use App\Services\Legacy\AdminExport\Steps\ApartmentStep;
use App\Services\Legacy\AdminExport\Steps\BlogArticleStep;
use App\Services\Legacy\AdminExport\Steps\BusStep;
use App\Services\Legacy\AdminExport\Steps\ContactMessageStep;
use App\Services\Legacy\AdminExport\Steps\CouponStep;
use App\Services\Legacy\AdminExport\Steps\CustomerStep;
use App\Services\Legacy\AdminExport\Steps\HomepageOfferStep;
use App\Services\Legacy\AdminExport\Steps\PageStep;
use App\Services\Legacy\AdminExport\Steps\PartnerBonusPlaceStep;
use App\Services\Legacy\AdminExport\Steps\PartnerFinanceStep;
use App\Services\Legacy\AdminExport\Steps\SeoRedirectStep;
use App\Services\Legacy\AdminExport\Steps\TestimonialStep;
use App\Services\Legacy\AdminExport\Steps\TextBlockStep;
use App\Services\Legacy\AdminExport\Steps\TourBookingStep;
use App\Services\Legacy\AdminExport\Steps\TourDeparturePlaceStep;
use App\Services\Legacy\AdminExport\Steps\TourInquiryStep;
use App\Services\Legacy\AdminExport\Steps\TourRegionGroupStep;
use App\Services\Legacy\AdminExport\Steps\TourSeasonalGroupStep;
use App\Services\Legacy\AdminExport\Steps\TourStep;
use App\Support\Legacy\AdminExport\LegacyAdminExport;
use App\Support\Legacy\AdminExport\LegacyAdminExportContext;
use App\Support\Legacy\AdminExport\LegacyAdminExportStepResult;
use App\Support\PublicContentCache;
use Closure;
use Illuminate\Contracts\Container\Container;
use InvalidArgumentException;
use Spatie\Activitylog\Facades\Activity;
use Throwable;

/**
 * The import of the full legacy admin export: runs its steps in order
 * (reference data first, then what refers to it), each step on its own so
 * one failing record or step never stops the rest, and records the run.
 */
final class LegacyAdminExportImportService
{
    /**
     * The steps in the order they run.
     *
     * @var array<int, class-string<LegacyAdminExportStep>>
     */
    private const STEPS = [
        TourDeparturePlaceStep::class,
        TourRegionGroupStep::class,
        TourSeasonalGroupStep::class,
        TourStep::class,
        ApartmentStep::class,
        BusStep::class,
        HomepageOfferStep::class,
        PageStep::class,
        TextBlockStep::class,
        BlogArticleStep::class,
        TestimonialStep::class,
        CustomerStep::class,
        CouponStep::class,
        ContactMessageStep::class,
        TourBookingStep::class,
        TourInquiryStep::class,
        ApartmentBookingStep::class,
        PartnerFinanceStep::class,
        PartnerBonusPlaceStep::class,
        SeoRedirectStep::class,
    ];

    public function __construct(private readonly Container $container) {}

    /**
     * @return array<int, string>
     */
    public function stepKeys(): array
    {
        return array_map(fn (LegacyAdminExportStep $step): string => $step->key(), $this->steps());
    }

    /**
     * @param  array<int, string>  $only  step keys; all steps when empty
     * @param  Closure(string, ?int, string): void  $progress  step, legacy id, outcome
     * @return array{run: LegacyImportRun|null, results: array<int, LegacyAdminExportStepResult>}
     *
     * @throws InvalidArgumentException when a step key is unknown
     */
    public function import(LegacyAdminExport $export, array $only, bool $dryRun, string $mediaMode, Closure $progress): array
    {
        $unknown = array_diff($only, $this->stepKeys());

        if ($unknown !== []) {
            throw new InvalidArgumentException('Unknown step(s): '.implode(', ', $unknown).'. Known steps: '.implode(', ', $this->stepKeys()).'.');
        }

        $run = $dryRun ? null : LegacyImportRun::query()->create([
            'source_file' => $export->path,
            'source_sha256' => $export->sha256,
            'dry_run' => false,
            'status' => LegacyImportRun::RUNNING,
            'started_at' => now(),
        ]);
        $context = new LegacyAdminExportContext($run, $mediaMode, $progress);
        $results = [];

        // Thousands of imported records would flood the activity log the office reads.
        Activity::withoutLogging(function () use ($export, $only, $context, &$results): void {
            foreach ($this->steps() as $step) {
                if ($only !== [] && ! in_array($step->key(), $only, true)) {
                    continue;
                }

                try {
                    $results[] = $step->run($export, $context);
                } catch (Throwable $exception) {
                    report($exception);
                    $failed = new LegacyAdminExportStepResult($step->key());
                    $failed->failed(null, 'The step stopped: '.$exception->getMessage());
                    $results[] = $failed;
                }
            }
        });

        if ($run !== null) {
            PublicContentCache::bump(PublicContentCache::BLOG, PublicContentCache::HOMEPAGE_CONTENT, PublicContentCache::PAGES, PublicContentCache::OFFERS, PublicContentCache::TESTIMONIALS, PublicContentCache::SITEMAP);
            $run->update([
                'status' => collect($results)->contains(fn (LegacyAdminExportStepResult $result): bool => $result->hasFailures())
                    ? LegacyImportRun::COMPLETED_WITH_ERRORS
                    : LegacyImportRun::COMPLETED,
                'finished_at' => now(),
                'summary' => ['steps' => array_map(fn (LegacyAdminExportStepResult $result): array => $result->toArray(), $results)],
            ]);
        }

        return ['run' => $run, 'results' => $results];
    }

    /**
     * @return array<int, LegacyAdminExportStep>
     */
    private function steps(): array
    {
        return array_map(fn (string $class): LegacyAdminExportStep => $this->container->make($class), self::STEPS);
    }
}
