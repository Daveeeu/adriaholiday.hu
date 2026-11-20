<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\TourPriceItem;
use App\Models\TourProgramDay;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

/**
 * The fixtures are legacy program blocks as stored on production, with the
 * place names and prices changed.
 */
class StructureTourProgramsCommandTest extends TestCase
{
    use RefreshDatabase;

    private const COMMAND = 'adria:tours:structure-program';

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
    }

    private function fixture(string $name): string
    {
        return (string) file_get_contents(base_path("tests/Fixtures/tour-programs/{$name}.html"));
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function tour(string $fixture, string $name, array $attributes = []): Tour
    {
        return Tour::factory()->create([
            'name' => $name,
            'program' => $this->fixture($fixture),
            'program_before' => null,
            'program_footer' => null,
            'prices' => null,
            'optional_programs' => null,
            'payment_program' => null,
            'notes' => null,
            ...$attributes,
        ]);
    }

    /**
     * The tour's price items as [type, text(, position)], included ones first.
     *
     * @return list<list<int|string>>
     */
    private function priceItems(Tour $tour, bool $withOrder = false): array
    {
        return TourPriceItem::query()
            ->where('tour_id', $tour->id)
            ->orderByRaw("type = 'excluded'")
            ->orderBy('sort_order')
            ->get()
            ->map(fn (TourPriceItem $item): array => $withOrder ? [$item->type, $item->text, $item->sort_order] : [$item->type, $item->text])
            ->all();
    }

    public function test_numbered_days_and_the_price_block_at_the_end_are_split_up(): void
    {
        $tour = $this->tour('numbered-days-price-block', 'Balkáni körutazás');

        $this->artisan(self::COMMAND, ['--apply' => true])
            ->expectsOutputToContain('Programs structured.')
            ->assertSuccessful();

        $tour->refresh();
        $days = $tour->programDays;

        $this->assertSame([1, 2, 3], $days->pluck('day_number')->all());
        $this->assertSame([
            'Belgrád: világvárosi pezsgés a Duna partján',
            'Durres – Tirana: tengerparti pihenés',
            // No title in the heading: the day's first sentence.
            'Reggeli után hazautazás, érkezés a késő esti órákban',
        ], $days->pluck('title')->all());
        $this->assertSame([1, 2, 3], $days->pluck('sort_order')->all());
        $this->assertStringContainsString('Út közben <strong>Belgrád </strong>látnivalóival', $days[0]->description);
        $this->assertStringNotContainsString('color', $days[1]->description);
        $this->assertStringNotContainsString('1. NAP', $days[0]->description);

        $this->assertSame([
            ['included', 'Autóbuszközlekedés', 1],
            ['included', '2 éj szállás Hotel***', 2],
            ['included', 'Idegenvezetés', 3],
            ['excluded', 'Üdülőhelyi illeték: 4.800 Ft/fő', 1],
            ['excluded', 'Egyágyas felár: 2027.06.05-12 között: 72.000 Ft/fő; 2027.07.03-10 között: 108.000 Ft/fő', 2],
            ['excluded', 'Útlemondási biztosítás: a részvételi díj 2,8%-a', 3],
        ], $this->priceItems($tour, withOrder: true));

        $this->assertNull($tour->program);
        $this->assertStringContainsString('Részvételi díj 276.900 Ft/fő', $tour->prices);
        $this->assertStringContainsString('Felszállási lehetőség:</strong> Miskolc, Hatvan, Budapest', $tour->program_footer);
        $this->assertStringContainsString('kártyás személyi igazolvány', $tour->program_footer);
        $this->assertNull($tour->program_before);
    }

    public function test_free_paragraphs_under_a_lone_day_heading_and_the_sections_after_the_program(): void
    {
        $tour = $this->tour('heading-only-days', 'Advent a hegyekben 2 nap');

        $this->artisan(self::COMMAND, ['--apply' => true])->assertSuccessful();

        $tour->refresh();
        $days = $tour->programDays;

        $this->assertSame(['Indulás a kora reggeli órákban, folyamatos utazás rövid pihenőkkel', 'Síparadicsom'], $days->pluck('title')->all());
        $this->assertStringContainsString('lovasszánozást', $days[0]->description);
        // The last day's options stay with it, as the page shows them under it.
        $this->assertStringContainsString('a., Libegőzés a csúcsra', $days[1]->description);
        $this->assertStringContainsString('b., Termálfürdő', $days[1]->description);

        $this->assertSame(
            [['included', 'Autóbusz közlekedés'], ['included', 'Idegenvezetés'], ['excluded', 'Belépők']],
            $this->priceItems($tour),
        );
        $this->assertStringContainsString('Részvételi díj: 20.600 Ft/fő', $tour->prices);
        $this->assertStringContainsString('Hajókirándulás a tavon: 25 euro/fő', $tour->optional_programs);
        // The h2 repeating the tour's name is left out.
        $this->assertStringNotContainsString('Advent a hegyekben', (string) $tour->program_before);
    }

    public function test_a_merged_day_keeps_its_range_and_the_text_around_the_days_is_kept(): void
    {
        $tour = $this->tour('merged-days', 'Velence tavasszal', ['program_footer' => '<p>Kérje ajánlatunkat!</p>']);

        $this->artisan(self::COMMAND, ['--apply' => true])->assertSuccessful();

        $tour->refresh();

        $this->assertSame([1, 3], $tour->programDays->pluck('day_number')->all());
        $this->assertSame('1–2. nap: Velence és a szigetek', $tour->programDays[0]->title);
        $this->assertStringContainsString('Másnap egész napos városnézés.', $tour->programDays[0]->description);
        $this->assertStringContainsString('Ajánlatunk a 2026/2027-es tanévre', $tour->program_before);
        // The program's own notes go before the existing footer.
        $this->assertMatchesRegularExpression('/bármely pontjáról.*Kérje ajánlatunkat!/s', $tour->program_footer);
        $this->assertCount(0, $tour->priceItems);
    }

    public function test_day_titles_in_capitals_are_written_as_the_program_writes_the_words(): void
    {
        $tour = $this->tour('numbered-days-price-block', 'Itália', [
            'program' => '<p><strong>1. NAP RÓMA ÉS A VATIKÁN KINCSE</strong><br>Délelőtt a Vatikáni Múzeumok, a pápák kincseit őrző termek.</p>'
                .'<p><strong>2. NAP OHRIDI-TÓ - HELLBRUNN KASTÉLY</strong><br>Séta a tóparton, majd a kastélyban.</p>'
                .'<p><strong>3. NAP ST. GILGEN - ANTIK BIRODALOM</strong><br>Hazautazás.</p>',
        ]);

        $this->artisan(self::COMMAND, ['--apply' => true])->assertSuccessful();

        $this->assertSame([
            'Róma és a Vatikán kincse',
            'Ohridi-tó – Hellbrunn kastély',
            // Words the program does not use: a name where a part of the title starts.
            'St. Gilgen – Antik birodalom',
        ], $tour->programDays()->pluck('title')->all());
    }

    public function test_a_program_without_day_headings_is_only_reported_for_manual_review(): void
    {
        $tour = $this->tour('no-day-headings', 'Vendégház a borvidéken');
        $program = $tour->program;

        $this->artisan(self::COMMAND, ['--apply' => true])
            ->expectsOutputToContain('nincs felismerhető napcím')
            ->expectsOutputToContain("Manual review: {$tour->id}")
            ->assertSuccessful();

        $this->assertSame($program, $tour->fresh()->program);
        $this->assertSame(0, TourProgramDay::count());
        $this->assertSame(0, TourPriceItem::count());
    }

    public function test_a_day_heading_not_in_bold_or_a_price_block_in_prose_needs_manual_review(): void
    {
        $unmarked = $this->tour('numbered-days-price-block', 'Nem félkövér', [
            'program' => '<p><strong>1. nap</strong><br>Indulás.</p><p>2. nap: Hazautazás.</p>',
        ]);
        $prose = $this->tour('numbered-days-price-block', 'Prózában', [
            'program' => '<p><strong>1. NAP</strong><br>Indulás.</p><p>Részvételi díj tartalmazza az autóbusz közlekedés költségeit.</p>',
        ]);

        $this->artisan(self::COMMAND, ['--apply' => true])
            ->expectsOutputToContain('nem félkövér napcím')
            ->expectsOutputToContain('az ár tartalma szövegesen')
            ->assertSuccessful();

        $this->assertNotNull($unmarked->fresh()->program);
        $this->assertNotNull($prose->fresh()->program);
        $this->assertSame(0, TourProgramDay::count());
    }

    public function test_an_already_structured_tour_is_skipped_unless_forced(): void
    {
        $tour = $this->tour('numbered-days-price-block', 'Balkáni körutazás');
        $tour->programDays()->create(['day_number' => 1, 'sort_order' => 1, 'title' => 'Kézzel írt nap']);

        $this->artisan(self::COMMAND, ['--apply' => true])
            ->expectsOutputToContain('már strukturált')
            ->assertSuccessful();

        $this->assertSame(['Kézzel írt nap'], $tour->programDays()->pluck('title')->all());
        $this->assertNotNull($tour->fresh()->program);

        $this->artisan(self::COMMAND, ['--apply' => true, '--force' => true])->assertSuccessful();

        $this->assertSame(3, $tour->programDays()->count());
        $this->assertNotContains('Kézzel írt nap', $tour->programDays()->pluck('title')->all());
    }

    public function test_a_dry_run_writes_nothing_but_the_report(): void
    {
        $tour = $this->tour('numbered-days-price-block', 'Balkáni körutazás');
        $program = $tour->program;

        $this->artisan(self::COMMAND)
            ->expectsOutputToContain('would_structure')
            ->expectsOutputToContain('Dry run: nothing was written.')
            ->assertSuccessful();

        $this->assertSame($program, $tour->fresh()->program);
        $this->assertSame(0, TourProgramDay::count());
        $this->assertSame(0, TourPriceItem::count());
        $this->assertSame(0, Activity::query()->where('event', 'program_structured')->count());

        $reports = Storage::disk('local')->files('tour-program-structure');
        $this->assertCount(2, $reports);
        $csv = Storage::disk('local')->get(collect($reports)->first(fn (string $path): bool => str_ends_with($path, '.csv')));
        $this->assertStringContainsString("{$tour->id};\"Balkáni körutazás\";would_structure;3;3;3;", $csv);
    }

    public function test_a_second_run_does_not_duplicate_and_the_original_is_kept(): void
    {
        $tour = $this->tour('numbered-days-price-block', 'Balkáni körutazás');
        $program = $tour->program;

        $this->artisan(self::COMMAND, ['--apply' => true])->assertSuccessful();
        $this->artisan(self::COMMAND, ['--apply' => true])
            ->expectsOutputToContain('nincs egyben tárolt program')
            ->assertSuccessful();

        $this->assertSame(3, TourProgramDay::count());
        $this->assertSame(6, TourPriceItem::count());

        $log = Activity::query()->where('event', 'program_structured')->sole();
        $this->assertSame($tour->id, $log->subject_id);
        $this->assertSame(3, $log->properties['days']);

        // The original program is in the tour's own change log and in the report.
        $change = Activity::query()->where('subject_id', $tour->id)->where('event', 'updated')->latest('id')->first();
        $this->assertSame($program, $change->attribute_changes['old']['program']);

        $report = collect(Storage::disk('local')->files('tour-program-structure'))
            ->filter(fn (string $path): bool => str_ends_with($path, '-apply.json'))
            ->map(fn (string $path): array => json_decode((string) Storage::disk('local')->get($path), true))
            ->first(fn (array $report): bool => $report['originals'] !== []);
        $this->assertSame($program, $report['originals'][$tour->id]['program']);
    }

    public function test_only_the_given_active_tours_are_processed(): void
    {
        $chosen = $this->tour('numbered-days-price-block', 'Balkáni körutazás');
        $other = $this->tour('numbered-days-price-block', 'Másik út');
        $inactive = $this->tour('numbered-days-price-block', 'Inaktív út', ['active' => false]);

        $this->artisan(self::COMMAND, ['--apply' => true, '--tour' => [$chosen->id, $inactive->id]])
            ->expectsOutputToContain('not active')
            ->assertSuccessful();

        $this->assertSame(3, $chosen->programDays()->count());
        $this->assertSame(0, $other->programDays()->count());
        $this->assertSame(0, $inactive->programDays()->count());
    }

    public function test_apply_and_dry_run_together_are_refused(): void
    {
        $this->artisan(self::COMMAND, ['--apply' => true, '--dry-run' => true])->assertFailed();
    }
}
