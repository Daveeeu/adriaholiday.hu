<?php

namespace App\Services\Tour\ProgramStructure;

use App\Models\Tour;
use App\Services\Tour\TourContentSyncService;
use Illuminate\Support\Facades\DB;

/**
 * Turns the one-block program of active tours (legacy imports) into program
 * days and price items, moving the rest of the text to the tour field it
 * belongs to (see TourProgramParser). Repeatable: tours that already have
 * program days or price items are left alone unless forced (then theirs are
 * replaced), and a program that cannot be split with confidence is never
 * changed, only reported for manual review.
 *
 * The program itself is emptied once split. The columns it changes are kept
 * as they were in the tour's program_structured activity log entry
 * (properties.original), in its updated entry and in the run's JSON report.
 */
final class TourProgramStructurer
{
    public const STRUCTURED = 'structured';

    public const WOULD_STRUCTURE = 'would_structure';

    public const MANUAL_REVIEW = 'manual_review';

    public const SKIPPED = 'skipped';

    /** The tour columns a split changes, kept in the report as they were. */
    private const CHANGED_COLUMNS = ['program', ...TourProgramParser::FIELDS];

    public function __construct(
        private readonly TourProgramParser $parser,
        private readonly TourContentSyncService $content,
    ) {}

    /**
     * @param  list<int>  $tourIds  only these tours (still only active ones)
     * @return array{rows: list<array{tour_id: int, name: string, status: string, days: int, included: int, excluded: int, moved_to: list<string>, manual_review: bool, reasons: string}>, originals: array<int, array<string, ?string>>}
     */
    public function run(bool $apply, array $tourIds = [], bool $force = false): array
    {
        $tours = Tour::query()
            ->where('active', true)
            ->when($tourIds !== [], fn ($query) => $query->whereIn('id', $tourIds))
            ->withCount(['programDays', 'priceItems'])
            ->orderBy('id')
            ->get();

        $rows = [];
        $originals = [];

        foreach ($tours as $tour) {
            // Kept before the split, as the backup of what it changes.
            $original = array_intersect_key($tour->getRawOriginal(), array_flip(self::CHANGED_COLUMNS));
            $row = $this->structure($tour, $apply, $force, $original);

            if ($row['status'] === self::STRUCTURED) {
                $originals[$tour->id] = $original;
            }

            $rows[] = $row;
        }

        return ['rows' => $rows, 'originals' => $originals];
    }

    /**
     * @param  array<string, ?string>  $original  the columns the split changes, as they are
     * @return array{tour_id: int, name: string, status: string, days: int, included: int, excluded: int, moved_to: list<string>, manual_review: bool, reasons: string}
     */
    private function structure(Tour $tour, bool $apply, bool $force, array $original): array
    {
        $row = ['tour_id' => $tour->id, 'name' => (string) $tour->name, 'days' => 0, 'included' => 0, 'excluded' => 0, 'moved_to' => [], 'manual_review' => false];

        if (! $this->hasText($tour->program)) {
            return [...$row, 'status' => self::SKIPPED, 'reasons' => 'nincs egyben tárolt program'];
        }

        if (! $force && ($tour->program_days_count > 0 || $tour->price_items_count > 0)) {
            return [...$row, 'status' => self::SKIPPED, 'reasons' => "már strukturált ({$tour->program_days_count} nap, {$tour->price_items_count} ártétel)"];
        }

        $program = $this->parser->parse((string) $tour->program, (string) $tour->name);
        $row = [
            ...$row,
            'days' => count($program->days),
            'included' => $program->priceItemCount(TourProgramParser::INCLUDED),
            'excluded' => $program->priceItemCount(TourProgramParser::EXCLUDED),
            'moved_to' => array_keys($program->fields),
        ];

        if ($program->needsReview()) {
            return [...$row, 'status' => self::MANUAL_REVIEW, 'manual_review' => true, 'reasons' => implode('; ', $program->reviewReasons)];
        }

        if (! $apply) {
            return [...$row, 'status' => self::WOULD_STRUCTURE, 'reasons' => ''];
        }

        DB::transaction(fn () => $this->apply($tour, $program, $original));

        return [...$row, 'status' => self::STRUCTURED, 'reasons' => ''];
    }

    /**
     * @param  array<string, ?string>  $original
     */
    private function apply(Tour $tour, StructuredProgram $program, array $original): void
    {
        $this->content->syncProgramDays($tour, array_map(
            fn (array $day, int $index): array => [...$day, 'sort_order' => $index + 1, 'active' => true],
            $program->days,
            array_keys($program->days),
        ));

        $positions = [];
        $this->content->syncPriceItems($tour, array_map(function (array $item) use (&$positions): array {
            $positions[$item['type']] = ($positions[$item['type']] ?? 0) + 1;

            return [...$item, 'sort_order' => $positions[$item['type']], 'active' => true];
        }, $program->priceItems));

        $tour->fill($this->fieldValues($tour, $program))->save();

        activity()
            ->performedOn($tour)
            ->event('program_structured')
            ->withProperties([
                'days' => count($program->days),
                'included' => $program->priceItemCount(TourProgramParser::INCLUDED),
                'excluded' => $program->priceItemCount(TourProgramParser::EXCLUDED),
                'moved_to' => array_keys($program->fields),
                // What the split changed, as it was: the whole program and the fields text was added to.
                'original' => $original,
            ])
            ->log('A program napokra és ártételekre bontva (adria:tours:structure-program)');
    }

    /**
     * The tour's new field values: the program emptied, the rest of its text
     * added to what each field already holds. The program's own notes go
     * before the existing program footer, as the page showed them.
     *
     * @return array<string, ?string>
     */
    private function fieldValues(Tour $tour, StructuredProgram $program): array
    {
        $values = ['program' => null];

        foreach ($program->fields as $field => $html) {
            $existing = $this->hasText($tour->{$field}) ? trim((string) $tour->{$field}) : null;

            $values[$field] = match (true) {
                $existing === null => $html,
                $field === TourProgramParser::FOOTER => $html."\n".$existing,
                default => $existing."\n".$html,
            };
        }

        return $values;
    }

    private function hasText(?string $html): bool
    {
        $text = html_entity_decode(strip_tags((string) $html), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return trim((string) preg_replace('/[\s\x{00A0}\x{200B}]+/u', ' ', $text)) !== '' || preg_match('/<(img|table|iframe)\b/i', (string) $html) === 1;
    }
}
