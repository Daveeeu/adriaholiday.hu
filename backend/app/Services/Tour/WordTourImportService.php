<?php

namespace App\Services\Tour;

use PhpOffice\PhpWord\Element\AbstractContainer;
use PhpOffice\PhpWord\Element\Table;
use PhpOffice\PhpWord\Element\Text;
use PhpOffice\PhpWord\Element\TextRun;
use PhpOffice\PhpWord\IOFactory;

/**
 * Best-effort parser for the AdriaHoliday tour program .docx template. Since
 * the source documents are free-form marketing copy rather than a strict
 * schema, this only extracts what can be recognized with reasonable
 * confidence (title, dates, day-by-day program, price, inclusions). Anything
 * uncertain is surfaced as a warning so an admin can review and correct the
 * result before the parsed draft is turned into a real Tour.
 */
class WordTourImportService
{
    private const TRAVEL_MODE_ADJECTIVES = [
        'autóbusz' => 'Autóbuszos',
        'repülő' => 'Repülős',
        'vonat' => 'Vonatos',
    ];

    private const LETTERHEAD_PATTERN = '/@|www\.|tel\/fax|eng\.sz[aá]m|v[aá]rosh[aá]z|miskolc|mkeh/iu';

    private const SECTION_BOUNDARY_PATTERN = '/^(r[eé]szv[eé]teli\s+d[ií]j|[üu]d[üu]l[őo]hely[a-z]*\s+illet[eé]k|vacsora|[1-9]\s*[aá]gyas\s+fel[aá]r|betegs[eé]g-|[uú]tlemond[aá]si|kellemes,|bel[eé]p[őo]k|fakultat[ií]v|audio[\s-]?guide)/iu';

    /**
     * @return array<string, mixed>
     */
    public function parse(string $filePath, string $originalFileName): array
    {
        $warnings = [];
        $paragraphs = $this->extractParagraphs($filePath);

        [$title, $subtitle, $bodyStart] = $this->extractTitle($paragraphs);

        if ($title === null) {
            $warnings[] = 'Nem sikerült azonosítani a program nevét, kérjük add meg kézzel.';
            $title = '';
        }

        $fullText = implode("\n", $paragraphs);

        $dates = $this->extractDates($fullText, $warnings);
        $accommodationHint = $this->extractAccommodationHint($fullText);

        [$programDays, $daysWarnings] = $this->extractProgramDays($paragraphs, $bodyStart);
        $warnings = [...$warnings, ...$daysWarnings];

        if ($programDays === []) {
            $warnings[] = 'Nem sikerült felismerni a napi programot, kérjük ellenőrizd és pótold kézzel.';
        }

        [$price, $inclusions] = $this->extractPrice($paragraphs);

        if ($price === null) {
            $warnings[] = 'Nem sikerült kinyerni a részvételi díjat, kérjük add meg kézzel.';
        }

        $travelModeHint = $this->extractTravelModeHint($inclusions ?? $fullText);

        $notes = $this->extractNotes($paragraphs, $inclusions);
        $regionHint = $this->extractRegionHint($originalFileName);

        return [
            'fileName' => $originalFileName,
            'name' => $title,
            'subtitle' => $subtitle,
            'listDescription' => $this->buildSummary($travelModeHint, $accommodationHint),
            'programDays' => $programDays,
            'dates' => $dates,
            'price' => $price,
            'inclusions' => $inclusions,
            'notes' => $notes,
            'travelModeHint' => $travelModeHint,
            'accommodationHint' => $accommodationHint,
            'regionHint' => $regionHint,
            'warnings' => $warnings,
        ];
    }

    /**
     * @return array<int, string>
     */
    private function extractParagraphs(string $filePath): array
    {
        $document = IOFactory::createReader('Word2007')->load($filePath);
        $paragraphs = [];

        foreach ($document->getSections() as $section) {
            foreach ($section->getElements() as $element) {
                if ($element instanceof Table) {
                    array_push($paragraphs, ...$this->tableRowsAsLines($element));

                    continue;
                }

                $paragraphs[] = $this->elementText($element);
            }
        }

        return $paragraphs;
    }

    /**
     * Flattens a table into one text line per row (cells joined with a
     * space) so the same line-based heuristics used for regular paragraphs
     * can also pick up label/value pairs such as "Részvételi díj | 149.800
     * Ft/fő" that the source document laid out as a two-column table.
     *
     * @return array<int, string>
     */
    private function tableRowsAsLines(Table $table): array
    {
        $lines = [];

        foreach ($table->getRows() as $row) {
            $cellTexts = [];

            foreach ($row->getCells() as $cell) {
                $cellText = trim($this->elementText($cell));

                if ($cellText !== '') {
                    $cellTexts[] = $cellText;
                }
            }

            if ($cellTexts !== []) {
                $lines[] = implode(' ', $cellTexts);
            }
        }

        return $lines;
    }

    private function elementText(mixed $element): string
    {
        if ($element instanceof Text) {
            return $element->getText();
        }

        if ($element instanceof TextRun || $element instanceof AbstractContainer) {
            $text = '';
            foreach ($element->getElements() as $child) {
                $text .= $this->elementText($child);
            }

            return $text;
        }

        return '';
    }

    /**
     * @param  array<int, string>  $paragraphs
     * @return array{0: ?string, 1: ?string, 2: int}
     */
    private function extractTitle(array $paragraphs): array
    {
        $index = 0;
        $count = count($paragraphs);

        while ($index < $count) {
            $line = trim($paragraphs[$index]);

            if ($line !== '' && ! preg_match(self::LETTERHEAD_PATTERN, $line)) {
                break;
            }

            $index++;
        }

        if ($index >= $count) {
            return [null, null, $count];
        }

        $title = trim($paragraphs[$index]);
        $index++;

        while ($index < $count && trim($paragraphs[$index]) === '') {
            $index++;
        }

        $subtitle = null;

        if ($index < $count) {
            $candidate = trim($paragraphs[$index]);

            if (
                $candidate !== ''
                && mb_strlen($candidate) <= 150
                && ! preg_match('/^(id[őo]pont|utaz[aá]s|elhelyez[eé]s|ell[aá]t[aá]s)\s*:/iu', $candidate)
                && ! preg_match('/^\s*(\d{1,2}\.\s*)?nap\b/iu', $candidate)
            ) {
                $subtitle = $candidate;
                $index++;
            }
        }

        return [$title, $subtitle, $index];
    }

    /**
     * @param  array<int, string>  $paragraphs
     * @param  array<int, string>  $warnings
     * @return array<int, array{startDate: string, endDate: string}>
     */
    private function extractDates(string $fullText, array &$warnings): array
    {
        if (! preg_match('/^\s*id[őo]pont\s*:\s*(.+)$/miu', $fullText, $match)) {
            if (! preg_match('/(\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\s*-\s*\d{1,2}(?:[,.].*)?)/u', $fullText, $fallback)) {
                $warnings[] = 'Nem sikerült kiolvasni az indulási időpontokat, kérjük add meg kézzel.';

                return [];
            }

            $raw = $fallback[1];
        } else {
            $raw = $match[1];
        }

        $raw = preg_split('/\r?\n/', trim($raw))[0] ?? '';
        $ranges = $this->parseDateRanges($raw);

        if ($ranges === []) {
            $warnings[] = 'Az indulási időpontokat nem sikerült értelmezni, kérjük add meg kézzel.';
        }

        return $ranges;
    }

    /**
     * @return array<int, array{startDate: string, endDate: string}>
     */
    private function parseDateRanges(string $raw): array
    {
        $year = null;
        $ranges = [];

        foreach (explode(',', $raw) as $segment) {
            $segment = trim($segment);

            if ($segment === '') {
                continue;
            }

            if (preg_match('/^(\d{4})\.\s*(.+)$/u', $segment, $match)) {
                $year = $match[1];
                $segment = trim($match[2]);
            }

            if ($year === null) {
                continue;
            }

            if (preg_match('/^(\d{1,2})\.\s*(\d{1,2})\s*-\s*(\d{1,2})\.\s*(\d{1,2})$/u', $segment, $match)) {
                $ranges[] = [
                    'startDate' => sprintf('%s-%02d-%02d', $year, (int) $match[1], (int) $match[2]),
                    'endDate' => sprintf('%s-%02d-%02d', $year, (int) $match[3], (int) $match[4]),
                ];

                continue;
            }

            if (preg_match('/^(\d{1,2})\.\s*(\d{1,2})\s*-\s*(\d{1,2})$/u', $segment, $match)) {
                $ranges[] = [
                    'startDate' => sprintf('%s-%02d-%02d', $year, (int) $match[1], (int) $match[2]),
                    'endDate' => sprintf('%s-%02d-%02d', $year, (int) $match[1], (int) $match[3]),
                ];
            }
        }

        return $ranges;
    }

    private function extractTravelModeHint(string $fullText): ?string
    {
        // Hungarian inflection can geminate the consonant before a suffix
        // (e.g. "autóbusszal" for the instrumental case), so "busz" alone
        // would not match literally — allow one or more "s" before the "z".
        if (preg_match('/aut[oó]bus+z/iu', $fullText)) {
            return 'autóbusz';
        }

        if (preg_match('/repül[őo]/iu', $fullText)) {
            return 'repülő';
        }

        if (preg_match('/vonat/iu', $fullText)) {
            return 'vonat';
        }

        return null;
    }

    private function extractAccommodationHint(string $fullText): ?string
    {
        if (preg_match('/hotel\s*\*{1,5}[^\n.,]*/iu', $fullText, $match)) {
            return trim($match[0]);
        }

        return null;
    }

    private function buildSummary(?string $travelModeHint, ?string $accommodationHint): string
    {
        $adjective = $travelModeHint ? (self::TRAVEL_MODE_ADJECTIVES[$travelModeHint] ?? ucfirst($travelModeHint)) : null;

        $parts = array_filter([
            $adjective ? $adjective.' körutazás' : null,
            $accommodationHint,
        ]);

        return implode(', ', $parts);
    }

    /**
     * @param  array<int, string>  $paragraphs
     * @return array{0: array<int, array{dayNumber: int, title: string, description: string}>, 1: array<int, string>}
     */
    private function extractProgramDays(array $paragraphs, int $startIndex): array
    {
        $days = [];
        $warnings = [];
        $counter = 0;
        $count = count($paragraphs);
        $i = $startIndex;

        while ($i < $count) {
            $line = trim($paragraphs[$i]);

            if ($line === '' || ! preg_match('/^\s*(?:(\d{1,2})\s*\.\s*)?nap\b\.?(.*)$/iu', $line, $match)) {
                $i++;

                continue;
            }

            $explicitDayNumber = $match[1] !== '' ? (int) $match[1] : null;
            $rawRemainder = $match[2];
            $counter = $explicitDayNumber ?? ($counter + 1);
            // "N. nap<TAB>TITLE" lays out the day title as a separate cell/tab
            // stop, with the description following in later paragraphs.
            // "N.nap <full description>" has no distinct title at all — the
            // rest of the same paragraph already is the description.
            $isTabSeparatedTitle = (bool) preg_match('/^[ ]*\t/u', $rawRemainder);
            $remainder = trim($rawRemainder);

            if (! $isTabSeparatedTitle) {
                if ($remainder !== '') {
                    $days[] = [
                        'dayNumber' => $counter,
                        'title' => $counter.'. nap',
                        'description' => $remainder,
                    ];
                    $i++;

                    continue;
                }
            }

            $dayTitle = $remainder;
            $descriptionParts = [];
            $i++;

            while ($i < $count) {
                $next = trim($paragraphs[$i]);

                if ($next === '') {
                    $i++;

                    continue;
                }

                if (preg_match('/^\s*(?:\d{1,2}\s*\.\s*)?nap\b/iu', $next) || preg_match(self::SECTION_BOUNDARY_PATTERN, $next)) {
                    break;
                }

                $descriptionParts[] = $next;
                $i++;
            }

            if ($dayTitle === '') {
                $warnings[] = ($counter).'. nap címét nem sikerült felismerni, kérjük ellenőrizd.';
            }

            $days[] = [
                'dayNumber' => $counter,
                'title' => $dayTitle !== '' ? $dayTitle : $counter.'. nap',
                'description' => implode("\n\n", $descriptionParts),
            ];
        }

        return [$days, $warnings];
    }

    /**
     * @param  array<int, string>  $paragraphs
     * @return array{0: ?int, 1: ?string}
     */
    private function extractPrice(array $paragraphs): array
    {
        $price = null;
        $inclusions = null;

        foreach ($paragraphs as $index => $paragraph) {
            $trimmed = trim($paragraph);

            if ($trimmed === '') {
                continue;
            }

            // Same-paragraph style: "Részvételi díj: 249.800 Ft/fő, mely tartalmazza..."
            if (preg_match('/r[eé]szv[eé]teli\s+d[ií]j:?\s*([\d.,\s]+)\s*ft/iu', $trimmed, $match)) {
                $price ??= $this->digitsToInt($match[1]);
                $inclusions ??= $trimmed;

                continue;
            }

            // Table-flattened style: "Részvételi díj" as its own paragraph,
            // followed immediately by "149.800 Ft/fő" as the next one.
            if (
                $price === null
                && preg_match('/^r[eé]szv[eé]teli\s+d[ií]j$/iu', $trimmed)
                && isset($paragraphs[$index + 1])
                && preg_match('/^([\d.,\s]+)\s*ft/iu', trim($paragraphs[$index + 1]), $match)
            ) {
                $price = $this->digitsToInt($match[1]);
            }

            if ($inclusions === null && preg_match('/tartalmazza\b/iu', $trimmed)) {
                $inclusions = $trimmed;
            }
        }

        return [$price, $inclusions];
    }

    private function digitsToInt(string $value): ?int
    {
        $digits = preg_replace('/[^\d]/', '', $value);

        return $digits !== '' && $digits !== null ? (int) $digits : null;
    }

    /**
     * @param  array<int, string>  $paragraphs
     */
    private function extractNotes(array $paragraphs, ?string $inclusions): string
    {
        $collecting = false;
        $lines = [];

        foreach ($paragraphs as $paragraph) {
            $trimmed = trim($paragraph);

            if ($trimmed === '' || $trimmed === $inclusions) {
                continue;
            }

            if (! $collecting && preg_match('/^bel[eé]p[őo]k\b/iu', $trimmed)) {
                $collecting = true;
            }

            if ($collecting) {
                $lines[] = $trimmed;

                continue;
            }

            if (preg_match('/^([üu]d[üu]l[őo]hely[a-z]*\s+illet[eé]k|vacsora|[1-9]\s*[aá]gyas\s+fel[aá]r|betegs[eé]g-|[uú]tlemond[aá]si)|tartalmazza\b/iu', $trimmed)) {
                $lines[] = $trimmed;
            }
        }

        if ($lines === []) {
            return '';
        }

        return implode("\n", array_map(fn (string $line): string => '<p>'.htmlspecialchars($line, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8').'</p>', $lines));
    }

    private function extractRegionHint(string $originalFileName): ?string
    {
        $name = pathinfo($originalFileName, PATHINFO_FILENAME);

        if (preg_match('/^([^-]+)-/u', $name, $match)) {
            return trim($match[1]);
        }

        return null;
    }
}
