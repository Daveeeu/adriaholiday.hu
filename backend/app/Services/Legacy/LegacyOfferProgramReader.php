<?php

namespace App\Services\Legacy;

use App\Support\RichTextSanitizer;
use DOMElement;
use DOMXPath;
use Illuminate\Support\Str;

/**
 * Reads the program tab of a legacy offer page. It has no structured program
 * days / price includes / notes: they are all <p> blocks of one rich-text
 * tab, so each paragraph, and each line of it, is classified by its text.
 *
 * - "N. NAP Title" starts a day; free paragraphs after it continue that day.
 * - Section headings ("Részvételi díj", "Az ár tartalmazza", "Milyen további
 *   költségek merülhetnek fel?", "Csatlakozási lehetőségek", "…kedvezmény…")
 *   may share a paragraph, and a price list may go on in the next one.
 * - Everything else is a note.
 *
 * Pure: takes the already-loaded program container and keeps no state
 * between reads.
 */
final class LegacyOfferProgramReader
{
    /**
     * Length limit of a program day title (tour_program_days.title).
     */
    private const PROGRAM_DAY_TITLE_MAX_LENGTH = 255;

    private const DAY_HEADING = '/^(\d{1,2})\.\s*NAP\.?\s*(.*)$/iu';

    /** @var array<int, array{day_number: int, title: string, description: string}> */
    private array $days = [];

    /** @var array<int, array{type: string, text: string}> */
    private array $priceItems = [];

    /** @var array<int, string> */
    private array $departurePlaces = [];

    /** @var array<int, string> sanitized HTML paragraphs */
    private array $notes = [];

    /** @var array<int, string> sanitized HTML paragraphs */
    private array $discounts = [];

    private ?float $price = null;

    /**
     * Free paragraphs after the latest day: the rest of that day, or notes
     * once the program turns out to be over.
     *
     * @var array<int, DOMElement>
     */
    private array $pendingParagraphs = [];

    private int $continuedDayCount = 0;

    private bool $programOpen = false;

    /** The price list ("included" / "excluded") the next lines may continue. */
    private ?string $listType = null;

    private bool $listHasBullets = false;

    /**
     * @return array{days: array<int, array{day_number: int, title: string, description: string}>, priceItems: array<int, array{type: string, text: string}>, departurePlaces: array<int, string>, notesHtml: ?string, discountsHtml: ?string, price: ?float}
     */
    public static function read(?DOMElement $container): array
    {
        $reader = new self;

        foreach ($container?->childNodes ?? [] as $node) {
            if ($node instanceof DOMElement && strtolower($node->tagName) === 'p') {
                $reader->readParagraph($node);
            }
        }

        $reader->closeProgram();

        return [
            'days' => $reader->days,
            'priceItems' => $reader->priceItems,
            'departurePlaces' => $reader->departurePlaces,
            'notesHtml' => $reader->notes !== [] ? implode("\n", $reader->notes) : null,
            'discountsHtml' => $reader->discounts !== [] ? implode("\n", $reader->discounts) : null,
            'price' => $reader->price,
        ];
    }

    private function readParagraph(DOMElement $node): void
    {
        $lines = $this->paragraphLines($node);

        if ($lines === []) {
            return;
        }

        if (preg_match(self::DAY_HEADING, $lines[0], $match)) {
            $this->continueLastDay();
            $this->days[] = $this->programDay((int) $match[1], trim($match[2]), $lines, $node);
            $this->programOpen = true;
            $this->listType = null;

            return;
        }

        $opensSection = collect($lines)->contains(fn (string $line): bool => $this->sectionOf($line) !== null);
        $continuesList = ! $opensSection && $this->listType !== null && $this->isBullet($lines[0]);

        if (! $opensSection && ! $continuesList && $this->programOpen) {
            $this->pendingParagraphs[] = $node;

            return;
        }

        $this->closeProgram();

        if (! $opensSection && ! $continuesList) {
            $this->listType = null;
            $this->notes[] = $this->sanitizeParagraph($node);

            return;
        }

        if ($this->sectionOf($lines[0]) === 'discounts') {
            $this->listType = null;
            $this->discounts[] = $this->sanitizeParagraph($node);

            return;
        }

        $noteLines = array_values(array_filter($lines, fn (string $line): bool => ! $this->readSectionLine($line)));

        if ($noteLines !== []) {
            $this->notes[] = '<p>'.implode('<br>', array_map(fn (string $line): string => e($line), $noteLines)).'</p>';
        }
    }

    /**
     * Applies one line of a section paragraph; false when it belongs to no
     * section and is a note.
     */
    private function readSectionLine(string $line): bool
    {
        $section = $this->sectionOf($line);

        if ($section === null) {
            // A bulleted list ends at its first line without a bullet.
            if ($this->listType === null || ($this->listHasBullets && ! $this->isBullet($line))) {
                $this->listType = null;

                return false;
            }

            $this->listHasBullets = $this->listHasBullets || $this->isBullet($line);
            $this->addPriceItem($this->listType, $line);

            return true;
        }

        $this->listType = null;
        $rest = $this->afterHeading($line);

        match ($section) {
            'price' => $this->readPriceLine($line),
            'included', 'excluded' => $this->startPriceList($section, $rest),
            'departures' => $this->departurePlaces = $this->placeNames($rest),
            'discounts' => $this->discounts[] = '<p>'.e($line).'</p>',
        };

        return true;
    }

    /**
     * The section a line opens, or null for free text. A bulleted line is
     * always a list item, whatever it mentions.
     */
    private function sectionOf(string $line): ?string
    {
        if ($this->isBullet($line)) {
            return null;
        }

        return match (true) {
            $this->containsCi($line, 'részvételi díj') => 'price',
            $this->containsCi($line, 'ár tartalmazza') => 'included',
            $this->containsCi($line, 'költségek merülhetnek fel'),
            $this->containsCi($line, 'további költségek'),
            $this->containsCi($line, 'nem tartalmazza') => 'excluded',
            $this->containsCi($line, 'csatlakozási lehetőség') => 'departures',
            $this->containsCi($line, 'kedvezmény') => 'discounts',
            default => null,
        };
    }

    /**
     * "Részvételi díj: 249.800 Ft/fő, mely tartalmazza az utazást autóbusszal,
     * 6 éj szállást… díját. Nem tartalmazza a belépőjegyek… díját." also
     * states, in prose, what the price includes and excludes.
     */
    private function readPriceLine(string $line): void
    {
        $this->price ??= $this->parsePrice($line);

        if (! $this->containsCi($line, 'tartalmazza')) {
            return;
        }

        $prose = (string) preg_replace('/^.*?tartalmazza/iu', '', $line);
        [$included, $excluded] = array_pad(preg_split('/\.\s*nem tartalmazza/iu', $prose, 2) ?: [], 2, '');

        $this->addPriceItem('included', Str::ucfirst(trim($included, " \t:.")));
        $this->addPriceItem('excluded', Str::ucfirst(trim($excluded, " \t:.")));
    }

    private function startPriceList(string $type, string $inlineItem): void
    {
        $this->listType = $type;
        $this->listHasBullets = false;
        $this->addPriceItem($type, $inlineItem);
    }

    private function addPriceItem(string $type, string $line): void
    {
        $text = trim((string) preg_replace('/^[-•–]\s*/u', '', $line));

        if ($text !== '') {
            $this->priceItems[] = ['type' => $type, 'text' => $text];
        }
    }

    /**
     * @return array<int, string>
     */
    private function placeNames(string $list): array
    {
        return collect(explode(',', $list))
            ->map(fn (string $place): string => trim($place))
            ->filter(fn (string $place): bool => $place !== '')
            ->values()
            ->all();
    }

    /**
     * The text after a heading's ":" or "?", e.g. an item on the heading's own line.
     */
    private function afterHeading(string $line): string
    {
        return preg_match('/^[^:?]*[:?]\s*(.*)$/u', $line, $match) ? trim($match[1]) : '';
    }

    private function continueLastDay(): void
    {
        if ($this->pendingParagraphs === []) {
            return;
        }

        $this->appendToLastDay($this->pendingParagraphs);
        $this->continuedDayCount++;
        $this->pendingParagraphs = [];
    }

    /**
     * Ends the program days at the first section after them. The last day
     * only continues in the next free paragraph when every earlier day did
     * too (offers written as "N. NAP Title" + a paragraph per day); otherwise
     * what follows the program is a note such as "A program tartalmaz olyan
     * látványosságokat…".
     */
    private function closeProgram(): void
    {
        $pending = $this->pendingParagraphs;
        $this->pendingParagraphs = [];
        $this->programOpen = false;

        if ($pending === []) {
            return;
        }

        if (count($this->days) > 1 && $this->continuedDayCount === count($this->days) - 1) {
            $this->appendToLastDay([array_shift($pending)]);
        }

        foreach ($pending as $node) {
            $this->notes[] = $this->sanitizeParagraph($node);
        }
    }

    /**
     * Appends paragraphs to the last day's description, as HTML paragraphs.
     *
     * @param  array<int, DOMElement>  $paragraphs
     */
    private function appendToLastDay(array $paragraphs): void
    {
        $index = array_key_last($this->days);
        $description = $this->days[$index]['description'];
        $parts = $description !== '' ? ['<p>'.e($description).'</p>'] : [];

        foreach ($paragraphs as $paragraph) {
            $parts[] = $this->sanitizeParagraph($paragraph);
        }

        $this->days[$index]['description'] = implode("\n", $parts);
    }

    /**
     * A day paragraph is usually "N. NAP Title<br>Description", but some offers put the whole
     * day on one line ("<strong>1.nap</strong> Description…"); there the bold part is the title.
     * A day without a usable title is titled after its number, since a program day needs one.
     *
     * @param  array<int, string>  $lines
     * @return array{day_number: int, title: string, description: string}
     */
    private function programDay(int $dayNumber, string $heading, array $lines, DOMElement $node): array
    {
        $title = $heading;
        $description = implode(' ', array_slice($lines, 1));

        if (count($lines) === 1) {
            $boldPrefix = $this->boldText($node);
            $hasBoldPrefix = $boldPrefix !== '' && Str::startsWith($lines[0], $boldPrefix);
            $title = $hasBoldPrefix
                ? trim((string) preg_replace('/^\d{1,2}\.\s*NAP\.?\s*/iu', '', $boldPrefix))
                : '';
            $description = $hasBoldPrefix ? trim(Str::after($lines[0], $boldPrefix)) : $heading;
        }

        // "VOLCJI POTOK - LJUBLJANA - KRANJ - Virágok…": the bold title keeps the dash before its subtitle.
        $title = (string) preg_replace('/[\s\-–]+$/u', '', $title);

        if (mb_strlen($title) > self::PROGRAM_DAY_TITLE_MAX_LENGTH) {
            $description = trim($title.' '.$description);
            $title = '';
        }

        return [
            'day_number' => $dayNumber,
            'title' => $title !== '' ? $title : "{$dayNumber}. nap",
            'description' => $description,
        ];
    }

    /**
     * The text of the paragraph's bold runs, joined in document order.
     */
    private function boldText(DOMElement $node): string
    {
        $text = '';

        $outermostBoldRuns = './/*[(self::strong or self::b) and not(ancestor::strong or ancestor::b)]';

        foreach ((new DOMXPath($node->ownerDocument))->query($outermostBoldRuns, $node) as $bold) {
            $text .= $bold->textContent;
        }

        return $this->normalizeWhitespace($text);
    }

    /**
     * @return array<int, string>
     */
    private function paragraphLines(DOMElement $node): array
    {
        $html = $node->ownerDocument?->saveHTML($node) ?: '';
        // Legacy editors wrote <br>, <br /> and <br style="…" /> alike.
        $html = (string) preg_replace('/<br\b[^>]*>/i', "\n", $html);
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        $lines = array_map(fn (string $line): string => $this->normalizeWhitespace($line), explode("\n", $text));

        return array_values(array_filter($lines, fn (string $line): bool => $line !== ''));
    }

    private function sanitizeParagraph(DOMElement $node): string
    {
        $html = $node->ownerDocument?->saveHTML($node) ?: '';

        return (string) RichTextSanitizer::sanitize($html);
    }

    private function isBullet(string $line): bool
    {
        return preg_match('/^[-•–]/u', $line) === 1;
    }

    private function parsePrice(string $text): ?float
    {
        if (! preg_match('/(\d{1,3}(?:\.\d{3})*)/u', $text, $match)) {
            return null;
        }

        $digits = str_replace('.', '', $match[1]);

        return $digits === '' ? null : (float) $digits;
    }

    private function normalizeWhitespace(string $text): string
    {
        return trim((string) preg_replace('/\s+/u', ' ', $text));
    }

    private function containsCi(string $haystack, string $needle): bool
    {
        return Str::contains(Str::lower($haystack), Str::lower($needle));
    }
}
