<?php

namespace App\Services\Tour\ProgramStructure;

use App\Support\RichTextSanitizer;
use Illuminate\Support\Str;

/**
 * Splits a tour program kept as one HTML block (legacy imports) into program
 * days, price items and the rest of the text by tour field:
 *
 * - A day starts at a bold or heading line "1. NAP …", "1.nap:", "1 nap",
 *   "1–2. nap", "Első nap", "Indulás napja", "Utolsó nap". The text until
 *   the next day is that day's description.
 * - "Az ár tartalmazza" / "Részvételi díj tartalmazza" and "Az ár nem
 *   tartalmazza" / "Milyen (további) költségek merülhetnek fel?" / "Felár"
 *   open a list of included / excluded price items, one per bulleted line.
 * - "Részvételi díj…" goes to prices; "Fakultatív…:" to optional_programs;
 *   "…hosszabbítás…:" to payment_program; the notes after the program
 *   (departure towns, travel documents, "A program tartalmaz…") and anything
 *   else after it to program_footer; what precedes the first day to
 *   program_before. An h2 repeating the tour name is left out.
 *
 * A program that cannot be split with confidence (no day heading, days out of
 * order, a day heading not in bold, a price block in prose, text that would
 * be lost) comes back with review reasons and must be left as it is.
 *
 * Deterministic and pure: the same HTML always gives the same result.
 */
final class TourProgramParser
{
    public const BEFORE = 'program_before';

    public const FOOTER = 'program_footer';

    public const PRICES = 'prices';

    public const OPTIONAL = 'optional_programs';

    public const PAYMENT = 'payment_program';

    /** The tour fields the rest of the text may go to, in the order they are reported. */
    public const FIELDS = [self::BEFORE, self::FOOTER, self::PRICES, self::OPTIONAL, self::PAYMENT];

    public const INCLUDED = 'included';

    public const EXCLUDED = 'excluded';

    private const DAY = 'day';

    /** A price paragraph saying in prose what the price includes. */
    private const PRICE_PROSE = 'price_prose';

    /** Longer day titles are shortened (the whole heading stays in the description). */
    private const TITLE_MAX_LENGTH = 120;

    /** A section heading ("Fakultatív programok:") is a short line. */
    private const SECTION_HEADING_MAX_LENGTH = 150;

    /** The longest first line still read as a whole day heading when the description follows on the next line. */
    private const DAY_HEADING_LINE_MAX_LENGTH = 150;

    private const NUMBERED_DAY = '/^(\d{1,2})\s*(?:[-–—]\s*(\d{1,2})\s*)?\.?\s*nap(?:ja)?(?![\p{L}])[\s.:\-–—]*/iu';

    private const WORD_DAY = '/^(első|második|harmadik|negyedik|ötödik|hatodik|hetedik|nyolcadik|kilencedik|tizedik|tizenegyedik|tizenkettedik|indulás|utolsó|hazautazás|hazaérkezés)\s+nap(?:ja)?(?![\p{L}])[\s.:\-–—]*/iu';

    /** A line that looks like a day heading although it is not in bold. */
    private const UNMARKED_DAY = '/^\d{1,2}\s*\.\s*nap(?![\p{L}])/iu';

    private const ORDINALS = [
        'első' => 1, 'második' => 2, 'harmadik' => 3, 'negyedik' => 4, 'ötödik' => 5, 'hatodik' => 6,
        'hetedik' => 7, 'nyolcadik' => 8, 'kilencedik' => 9, 'tizedik' => 10, 'tizenegyedik' => 11,
        'tizenkettedik' => 12, 'indulás' => 1,
    ];

    private const NOTE_HEADING = '/^(felszállás|csatlakozás|útiokmány|úti okmány|beutazás|az utazáshoz|a program tartalmaz|a programváltoztatás|a programok sorrendje|a program sorrendje|figyelem|kérje ajánlat|kérjék ajánlat|kérjen ajánlat|csoportot szervez|dunántúli|hazafelé|fedezzük fel|megjegyzés|fontos tudnivaló)/u';

    private const OPTION = '/^([a-h]\s*[.,)]|[-•–])/u';

    private const BULLET = '/^[-–•*·]+\s*/u';

    // State of one parse() call.

    /** @var array<string, list<array<string, mixed>>> paragraphs by tour field */
    private array $paragraphs = [];

    /** @var list<array{number: int, end: int, heading: string, fullHeading: string, paragraphs: list<array<string, mixed>>, headingBlock: int, headingOnly: bool}> */
    private array $days = [];

    /** @var list<array{type: string, text: string}> */
    private array $priceItems = [];

    /** @var list<array{block: int, tag: string, align: ?string, lines?: list<ProgramLine>, whole?: ProgramBlock}> free blocks after the latest day */
    private array $pending = [];

    private string $sink = self::BEFORE;

    private bool $daysClosed = false;

    private int $continuedDays = 0;

    private int $listItemCount = 0;

    private bool $listHasBullets = false;

    private bool $listItemContinues = false;

    private bool $hasPriceProse = false;

    private int $blockIndex = 0;

    private ?ProgramBlock $block = null;

    /** @var list<string> */
    private array $reviewReasons = [];

    /** @var list<string> text left out on purpose (headings shown by the page itself) */
    private array $dropped = [];

    /** @var list<string> */
    private array $originalTexts = [];

    public function __construct(private readonly ProgramHtmlReader $reader) {}

    public function parse(string $html, string $tourName): StructuredProgram
    {
        $this->reset();
        $blocks = $this->reader->read($html);

        foreach ($blocks as $index => $block) {
            $this->blockIndex = $index;
            $this->block = $block;
            $this->originalTexts[] = $block->text;

            if ($this->days === [] && $this->repeatsTourName($block, $tourName)) {
                $this->dropped[] = $block->text;

                continue;
            }

            if ($block->isWhole()) {
                $this->readWholeBlock($block);

                continue;
            }

            foreach ($block->lines as $lineIndex => $line) {
                $this->readLine($block, $lineIndex, $line);
            }
        }

        $this->closeDays();
        $this->finishList();

        return $this->result();
    }

    private function reset(): void
    {
        $this->paragraphs = array_fill_keys(self::FIELDS, []);
        $this->days = [];
        $this->priceItems = [];
        $this->pending = [];
        $this->sink = self::BEFORE;
        $this->daysClosed = false;
        $this->continuedDays = 0;
        $this->listItemCount = 0;
        $this->listHasBullets = false;
        $this->listItemContinues = false;
        $this->hasPriceProse = false;
        $this->blockIndex = 0;
        $this->block = null;
        $this->reviewReasons = [];
        $this->dropped = [];
        $this->originalTexts = [];
    }

    private function readWholeBlock(ProgramBlock $block): void
    {
        if ($this->sink === self::DAY) {
            $this->pending[] = ['block' => $this->blockIndex, 'tag' => $block->tag, 'align' => null, 'whole' => $block];

            return;
        }

        if ($this->isList($this->sink) && $block->listItems !== []) {
            foreach ($block->listItems as $item) {
                $this->addPriceItem($item);
            }

            return;
        }

        if ($this->isList($this->sink)) {
            $this->endList();
        }

        $this->paragraphs[$this->sink][] = ['block' => $this->blockIndex, 'html' => $block->html];
    }

    private function readLine(ProgramBlock $block, int $lineIndex, ProgramLine $line): void
    {
        $kind = $this->classify($block, $line);

        if ($kind === self::DAY) {
            $this->startDay($block, $lineIndex, $line);

            return;
        }

        if ($kind !== null) {
            $this->closeDays();
            $this->finishList();

            if ($this->isList($kind)) {
                $this->startList($kind, $line);

                return;
            }

            $this->hasPriceProse = $this->hasPriceProse || $kind === self::PRICE_PROSE;
            $this->sink = $kind === self::PRICE_PROSE ? self::PRICES : $kind;
            $this->addLine($this->sink, $line);

            return;
        }

        if ($this->sink === self::DAY) {
            if ($this->blockIndex === $this->lastDay()['headingBlock']) {
                $this->addDayLine($line);
            } else {
                $this->addPendingLine($line);
            }

            return;
        }

        if ($this->isList($this->sink)) {
            $this->readListLine($lineIndex, $line);

            return;
        }

        $this->addLine($this->sink, $line);
    }

    /**
     * What a line starts: a day, a price list, a section of the tour page,
     * or nothing (null: it continues the current part).
     */
    private function classify(ProgramBlock $block, ProgramLine $line): ?string
    {
        $text = $line->text();

        if ($this->dayHeadingMatch($block, $line) !== null) {
            return self::DAY;
        }

        if (preg_match(self::UNMARKED_DAY, $text) === 1) {
            $this->addReviewReason('nem félkövér napcím: "'.Str::limit($text, 40).'"');
        }

        if (preg_match(self::BULLET, $text) === 1) {
            return null;
        }

        $lower = mb_strtolower($text);
        $priceKind = $this->priceListKind($lower) ?? $this->priceKind($lower);

        if ($priceKind !== null) {
            return $priceKind;
        }

        // Inside a day's own paragraph only a price block ends the day.
        if ($this->sink === self::DAY && $this->blockIndex === $this->lastDay()['headingBlock']) {
            return null;
        }

        if ($this->isSectionHeading($block, $text) && str_contains($lower, 'hosszabbítás')) {
            return self::PAYMENT;
        }

        if ($this->isSectionHeading($block, $text) && preg_match('/^(további\s+)?fakultatív/u', $lower) === 1) {
            return self::OPTIONAL;
        }

        // The text after an optional programs heading is theirs, notes included.
        if (! in_array($this->sink, [self::OPTIONAL, self::PAYMENT], true) && preg_match(self::NOTE_HEADING, $lower) === 1) {
            return self::FOOTER;
        }

        return null;
    }

    /**
     * "Az ár tartalmazza:", "Részvételi díj nem tartalmazza:", "Milyen további
     * költségek merülhetnek fel?", "Felárak:". A line going on in prose
     * ("Részvételi díj tartalmazza az autóbusz közlekedés…") is no list.
     */
    private function priceListKind(string $lower): ?string
    {
        if (preg_match('/^(?:az\s+)?(?:utazás\s+)?(?:ár|ára|árak|részvételi\s+díj(?:ak)?)\s+(nem\s+)?tartalmaz(?:za|zák|za\s+a\s+következőket)?\s*([:?])?\s*(.*)$/u', $lower, $match)
            || preg_match('/^(nem\s+)tartalmazza\s*([:?])?\s*(.*)$/u', $lower, $match)) {
            if ($match[2] === '' && $match[3] !== '') {
                return self::PRICE_PROSE;
            }

            return $match[1] !== '' ? self::EXCLUDED : self::INCLUDED;
        }

        if (preg_match('/^(milyen\s+)?(további\s+)?költségek\s+merülhetnek\s+fel/u', $lower)
            || preg_match('/^további\s+költségek\s*[:?]/u', $lower)
            || preg_match('/^felár(ak)?\s*:?$/u', $lower)) {
            return self::EXCLUDED;
        }

        return null;
    }

    private function priceKind(string $lower): ?string
    {
        if (preg_match('/^részvételi\s+díj(ak)?(?![\p{L}])/u', $lower) !== 1) {
            return null;
        }

        return str_contains($lower, 'tartalmaz') ? self::PRICE_PROSE : self::PRICES;
    }

    /**
     * A short line ending in ":" ("Fakultatív kirándulási lehetőségek:"), or
     * a short paragraph of its own.
     */
    private function isSectionHeading(ProgramBlock $block, string $text): bool
    {
        return mb_strlen($text) <= self::SECTION_HEADING_MAX_LENGTH
            && (str_ends_with($text, ':') || count($block->lines) === 1);
    }

    /**
     * @return ?array{number: ?int, end: ?int, prefix: string}
     */
    private function dayHeadingMatch(ProgramBlock $block, ProgramLine $line): ?array
    {
        $candidate = $block->isHeading() ? $line->text() : $line->boldPrefix();

        if ($candidate === '') {
            return null;
        }

        if (preg_match(self::NUMBERED_DAY, $candidate, $match)) {
            $number = (int) $match[1];
            $end = isset($match[2]) && $match[2] !== '' ? (int) $match[2] : $number;

            return ['number' => $number, 'end' => $end, 'prefix' => $match[0]];
        }

        if (preg_match(self::WORD_DAY, $candidate, $match)) {
            $number = self::ORDINALS[mb_strtolower($match[1])] ?? null;

            return ['number' => $number, 'end' => $number, 'prefix' => $match[0]];
        }

        return null;
    }

    private function startDay(ProgramBlock $block, int $lineIndex, ProgramLine $line): void
    {
        $match = $this->dayHeadingMatch($block, $line);

        if ($this->sink === self::DAY && $this->pending !== []) {
            $this->appendToLastDay($this->pending);
            $this->pending = [];
            $this->continuedDays++;
        }

        $this->finishList();

        if ($this->daysClosed) {
            $this->addReviewReason('napcím a program utáni részben: "'.Str::limit($line->text(), 40).'"');
        }

        $expected = $this->days === [] ? 1 : $this->lastDay()['end'] + 1;
        $number = $match['number'] ?? $expected;
        $end = $match['end'] ?? $number;

        if ($number !== $expected || $end < $number) {
            $this->addReviewReason("ellentmondó napszámozás: {$expected}. nap helyett \"".Str::limit($line->text(), 30).'"');
        }

        $isLastLine = $lineIndex === count($block->lines) - 1;
        $wholeLineIsHeading = $block->isHeading()
            || $line->isAllBold()
            || (! $isLastLine && mb_strlen($line->text()) <= self::DAY_HEADING_LINE_MAX_LENGTH);
        $heading = $wholeLineIsHeading ? $line->text() : $line->boldPrefix();

        // "<strong>2. nap: Sirok vár</strong>a festői…": a bold start ending
        // inside a word is no title; the heading is the day number only.
        if (! $wholeLineIsHeading && preg_match('/\p{L}$/u', $heading) && preg_match('/^\p{L}/u', mb_substr($line->text(), mb_strlen($heading)))) {
            $heading = $match['prefix'] ?? $heading;
        }

        $rest = $wholeLineIsHeading ? null : $line->withoutLeading(mb_strlen($heading));
        // The day number is the program day's own field.
        $this->dropped[] = $match['prefix'] ?? '';

        $this->days[] = [
            'number' => $number,
            'end' => $end,
            'heading' => $this->headingTitle($heading, $match['prefix'] ?? ''),
            'fullHeading' => $heading,
            'paragraphs' => [],
            'headingBlock' => $this->blockIndex,
            'headingOnly' => $isLastLine && ($rest === null || $rest->runs === []),
        ];
        $this->sink = self::DAY;
        $this->daysClosed = false;

        if ($rest !== null && $rest->runs !== []) {
            $this->addDayLine($rest);
        }
    }

    /**
     * Ends the program days at the first part after them. The free
     * paragraphs after the last day are still that day's when its heading
     * stands alone ("1. NAP" with the description below it) or every earlier
     * day went on in paragraphs too; else an option list the last day
     * introduces ("…választható fakultatív kirándulás:" + "a., …") is the
     * day's and the rest goes to program_footer.
     */
    private function closeDays(): void
    {
        if ($this->sink !== self::DAY) {
            return;
        }

        $pending = $this->pending;
        $this->pending = [];
        $this->sink = self::FOOTER;
        $this->daysClosed = true;
        $last = $this->lastDay();
        $dayCount = count($this->days);

        if ($last['headingOnly'] || ($dayCount > 1 && $this->continuedDays === $dayCount - 1)) {
            $this->appendToLastDay($pending);

            return;
        }

        if ($this->introducesOptions($pending)) {
            $options = [array_shift($pending)];

            while ($pending !== [] && preg_match(self::OPTION, $this->fragmentText($pending[0])) === 1) {
                $options[] = array_shift($pending);
            }

            $this->appendToLastDay($options);
        }

        foreach ($pending as $fragment) {
            $this->paragraphs[self::FOOTER][] = $this->fragmentParagraph($fragment);
        }
    }

    /**
     * @param  list<array<string, mixed>>  $pending
     */
    private function introducesOptions(array $pending): bool
    {
        return count($pending) > 1
            && str_ends_with($this->fragmentText($pending[0]), ':')
            && preg_match(self::OPTION, $this->fragmentText($pending[1])) === 1;
    }

    private function startList(string $type, ProgramLine $line): void
    {
        $this->sink = $type;
        $this->listItemCount = 0;
        $this->listHasBullets = false;
        $this->listItemContinues = false;

        $text = $line->text();
        $rest = preg_match('/^[^:?]*[:?]\s*(.*)$/u', $text, $match) ? trim($match[1]) : '';
        $this->dropped[] = $rest === '' ? $text : mb_substr($text, 0, mb_strlen($text) - mb_strlen($rest));

        if ($rest !== '') {
            $this->readListLine(1, new ProgramLine([['text' => $rest, 'strong' => false, 'em' => false, 'href' => null]]));
        }
    }

    /**
     * A bulleted line is an item; a line after an item ending in ":" goes on
     * with it ("- egyágyas felár:" + one line per date); a list without
     * bullets is one item per line of its paragraph. Any other line ends the
     * list and goes to program_footer.
     */
    private function readListLine(int $lineIndex, ProgramLine $line): void
    {
        $text = $line->text();

        if ($lineIndex === 0) {
            $this->listItemContinues = false;
        }

        if (preg_match(self::BULLET, $text) === 1) {
            $this->listHasBullets = true;
            $this->addPriceItem($text);
            $this->listItemContinues = str_ends_with($text, ':');

            return;
        }

        if ($this->listItemContinues) {
            $last = array_key_last($this->priceItems);
            $separator = str_ends_with($this->priceItems[$last]['text'], ':') ? ' ' : '; ';
            $this->priceItems[$last]['text'] .= $separator.$text;

            return;
        }

        if ($this->listItemCount === 0 || (! $this->listHasBullets && $lineIndex > 0)) {
            $this->addPriceItem($text);

            return;
        }

        $this->endList();
        $this->addLine(self::FOOTER, $line);
    }

    private function addPriceItem(string $text): void
    {
        $text = trim((string) preg_replace(self::BULLET, '', $text));

        if ($text === '') {
            return;
        }

        $this->priceItems[] = ['type' => $this->sink, 'text' => Str::ucfirst($text)];
        $this->listItemCount++;
    }

    private function endList(): void
    {
        $this->finishList();
        $this->sink = self::FOOTER;
    }

    private function finishList(): void
    {
        if ($this->isList($this->sink) && $this->listItemCount === 0) {
            $this->addReviewReason('ártétel-lista tételek nélkül ('.($this->sink === self::INCLUDED ? 'tartalmazza' : 'nem tartalmazza').')');
        }
    }

    private function isList(string $sink): bool
    {
        return $sink === self::INCLUDED || $sink === self::EXCLUDED;
    }

    private function addLine(string $field, ProgramLine $line): void
    {
        $this->appendLine($this->paragraphs[$field], $line);
    }

    private function addDayLine(ProgramLine $line): void
    {
        $this->appendLine($this->days[array_key_last($this->days)]['paragraphs'], $line);
    }

    /**
     * Adds a line to the paragraph of the current block, or starts one.
     *
     * @param  list<array<string, mixed>>  $paragraphs
     */
    private function appendLine(array &$paragraphs, ProgramLine $line): void
    {
        $last = array_key_last($paragraphs);

        if ($last !== null && ($paragraphs[$last]['block'] ?? null) === $this->blockIndex && isset($paragraphs[$last]['lines'])) {
            $paragraphs[$last]['lines'][] = $line->html();

            return;
        }

        $paragraphs[] = ['block' => $this->blockIndex, 'tag' => $this->block?->tag ?? 'p', 'align' => $this->block?->align, 'lines' => [$line->html()]];
    }

    private function addPendingLine(ProgramLine $line): void
    {
        $last = array_key_last($this->pending);

        if ($last !== null && $this->pending[$last]['block'] === $this->blockIndex && isset($this->pending[$last]['lines'])) {
            $this->pending[$last]['lines'][] = $line;

            return;
        }

        $this->pending[] = ['block' => $this->blockIndex, 'tag' => $this->block?->tag ?? 'p', 'align' => $this->block?->align, 'lines' => [$line]];
    }

    /**
     * @param  list<array<string, mixed>>  $fragments
     */
    private function appendToLastDay(array $fragments): void
    {
        $index = array_key_last($this->days);

        foreach ($fragments as $fragment) {
            $this->days[$index]['paragraphs'][] = $this->fragmentParagraph($fragment);
        }
    }

    /**
     * @param  array<string, mixed>  $fragment
     * @return array<string, mixed>
     */
    private function fragmentParagraph(array $fragment): array
    {
        if (isset($fragment['whole'])) {
            return ['block' => $fragment['block'], 'html' => $fragment['whole']->html];
        }

        return [
            'block' => $fragment['block'],
            'tag' => $fragment['tag'],
            'align' => $fragment['align'],
            'lines' => array_map(fn (ProgramLine $line): string => $line->html(), $fragment['lines']),
        ];
    }

    /**
     * @param  array<string, mixed>  $fragment
     */
    private function fragmentText(array $fragment): string
    {
        return isset($fragment['whole'])
            ? $fragment['whole']->text
            : implode("\n", array_map(fn (ProgramLine $line): string => $line->text(), $fragment['lines']));
    }

    /**
     * @return array{number: int, end: int, heading: string, fullHeading: string, paragraphs: list<array<string, mixed>>, headingBlock: int, headingOnly: bool}
     */
    private function lastDay(): array
    {
        return $this->days[array_key_last($this->days)];
    }

    /**
     * The h2 opening many legacy programs only repeats the tour's name.
     */
    private function repeatsTourName(ProgramBlock $block, string $tourName): bool
    {
        $isTitle = $block->isHeading() || (count($block->lines) === 1 && $block->lines[0]->isAllBold());
        $title = $this->comparable($block->text);
        $name = $this->comparable($tourName);

        return $isTitle && $title !== '' && $name !== '' && (str_starts_with($name, $title) || str_starts_with($title, $name));
    }

    private function comparable(string $text): string
    {
        return (string) preg_replace('/[^a-z0-9]/', '', Str::lower(Str::ascii($text)));
    }

    private function addReviewReason(string $reason): void
    {
        if (! in_array($reason, $this->reviewReasons, true)) {
            $this->reviewReasons[] = $reason;
        }
    }

    /**
     * The day's title from its heading without the day number: "1. NAP
     * DURRES - TIRANA: tengerparti pihenés" → "Durres – Tirana: tengerparti pihenés".
     */
    private function headingTitle(string $heading, string $prefix): string
    {
        $title = $this->trimSeparators(mb_substr($heading, mb_strlen($prefix)));
        // Words in capitals are written as names: "OHRIDI-TÓ" → "Ohridi-tó".
        $title = (string) preg_replace_callback(
            '/(?<![\p{L}\p{N}])\p{Lu}{2,}(?![\p{L}\p{N}])/u',
            function (array $word) use ($title): string {
                [$text, $offset] = $word[0];
                $lower = mb_strtolower($text);

                return match (true) {
                    preg_match('/^[IVXLCDM]+$/', $text) === 1 => $text,
                    $offset > 0 && $title[$offset - 1] === '-' => $lower,
                    default => mb_convert_case($lower, MB_CASE_TITLE),
                };
            },
            $title,
            flags: PREG_OFFSET_CAPTURE,
        );

        return $this->trimSeparators((string) preg_replace('/\s+-\s+/u', ' – ', $title));
    }

    private function trimSeparators(string $text): string
    {
        return (string) preg_replace('/^[\s.:\-–—]+|[\s.:\-–—]+$/u', '', $text);
    }

    private function result(): StructuredProgram
    {
        if ($this->days === []) {
            $this->addReviewReason('nincs felismerhető napcím');
        }

        if ($this->hasPriceProse && ! in_array(self::INCLUDED, array_column($this->priceItems, 'type'), true)) {
            $this->addReviewReason('az ár tartalma szövegesen, nem listában');
        }

        $days = array_map(fn (array $day): array => $this->dayResult($day), $this->days);

        foreach ($days as $day) {
            if (trim(strip_tags($day['description'])) === '') {
                $this->addReviewReason("üres nap: {$day['day_number']}. nap");
            }
        }

        $fields = [];

        foreach (self::FIELDS as $field) {
            $html = RichTextSanitizer::tripText($this->renderParagraphs($this->paragraphs[$field]));

            if ($html !== null) {
                $fields[$field] = $html;
            }
        }

        $this->checkNothingLost($days, $fields);

        return new StructuredProgram($days, $this->priceItems, $fields, $this->reviewReasons);
    }

    /**
     * @param  array<string, mixed>  $day
     * @return array{day_number: int, title: string, description: string}
     */
    private function dayResult(array $day): array
    {
        $paragraphs = $day['paragraphs'];
        $title = $day['heading'];

        // A long heading is shortened as the title and kept whole in the description.
        if (mb_strlen($title) > self::TITLE_MAX_LENGTH) {
            array_unshift($paragraphs, ['tag' => 'p', 'align' => null, 'lines' => ['<strong>'.e($day['fullHeading']).'</strong>']]);
            $title = $this->shortened($title);
        }

        $description = (string) RichTextSanitizer::tripText($this->renderParagraphs($paragraphs));

        if ($title === '') {
            $title = $this->shortened($this->firstSentence($this->plainText($description)));
        }

        $label = $day['end'] > $day['number'] ? "{$day['number']}–{$day['end']}. nap" : null;

        return [
            'day_number' => $day['number'],
            'title' => match (true) {
                $title === '' => $label ?? "{$day['number']}. nap",
                $label !== null => "{$label}: {$title}",
                default => $title,
            },
            'description' => $description,
        ];
    }

    private function firstSentence(string $text): string
    {
        $sentence = preg_match('/^(.+?[.!?])(?:\s|$)/u', $text, $match) ? $match[1] : $text;

        return rtrim(trim($sentence), '.');
    }

    private function shortened(string $text): string
    {
        return mb_strlen($text) <= self::TITLE_MAX_LENGTH ? $text : Str::limit($text, self::TITLE_MAX_LENGTH - 1, '…', preserveWords: true);
    }

    /**
     * @param  list<array<string, mixed>>  $paragraphs
     */
    private function renderParagraphs(array $paragraphs): string
    {
        return implode("\n", array_map(function (array $paragraph): string {
            if (isset($paragraph['html'])) {
                return $paragraph['html'];
            }

            $style = $paragraph['align'] !== null ? ' style="text-align: '.$paragraph['align'].'"' : '';

            return "<{$paragraph['tag']}{$style}>".implode('<br>', $paragraph['lines'])."</{$paragraph['tag']}>";
        }, $paragraphs));
    }

    /**
     * Every word of the program must end up somewhere (the left-out
     * headings aside); a split losing text is left for manual review.
     *
     * @param  list<array{day_number: int, title: string, description: string}>  $days
     * @param  array<string, string>  $fields
     */
    private function checkNothingLost(array $days, array $fields): void
    {
        $output = [
            ...array_map(fn (array $day): string => $day['title'].' '.$this->plainText($day['description']), $days),
            ...array_column($this->priceItems, 'text'),
            ...array_map(fn (string $html): string => $this->plainText($html), array_values($fields)),
        ];

        $available = $this->wordCounts($output);
        $dropped = $this->wordCounts($this->dropped);
        $missing = [];

        foreach ($this->wordCounts($this->originalTexts) as $word => $count) {
            if ($count - ($dropped[$word] ?? 0) > ($available[$word] ?? 0)) {
                $missing[] = $word;
            }
        }

        if ($missing !== []) {
            $this->addReviewReason('szöveg veszne el: '.implode(', ', array_slice($missing, 0, 5)));
        }
    }

    /**
     * @param  list<string>  $texts
     * @return array<string, int>
     */
    private function wordCounts(array $texts): array
    {
        preg_match_all('/[\p{L}\p{N}]+/u', mb_strtolower(implode(' ', $texts)), $matches);

        return array_count_values($matches[0]);
    }

    private function plainText(string $html): string
    {
        $text = (string) preg_replace('/<br\s*\/?>|<\/(p|h\d|li|td|th|tr|blockquote)>/i', ' ', $html);
        $text = html_entity_decode(strip_tags($text), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return trim((string) preg_replace('/[\s\x{00A0}]+/u', ' ', $text));
    }
}
