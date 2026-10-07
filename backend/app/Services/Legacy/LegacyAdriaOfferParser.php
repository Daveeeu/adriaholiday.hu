<?php

namespace App\Services\Legacy;

use App\Support\Legacy\LegacyOfferData;
use DOMDocument;
use DOMElement;
use DOMXPath;
use Illuminate\Support\Str;

/**
 * Pure HTML -> data parser for a single legacy adriaholiday.hu offer detail page.
 * No I/O: takes the already-fetched HTML and returns a LegacyOfferData DTO.
 *
 * The program tab (days, price includes, notes) is read by
 * LegacyOfferProgramReader.
 *
 * Booking options (extras, departure places) are not part of the page; the
 * caller fetches them per legacy date id (see legacyDateIds()) and passes the
 * raw responses in, so this class stays free of I/O.
 */
class LegacyAdriaOfferParser
{
    /**
     * Legacy tour group slug (or crawl context passed to the import command)
     * => name of the portfolio category its offers belong to.
     */
    private const CATEGORY_NAMES = [
        'korutazas' => 'Körutazások',
        'tengerparti-udulesek' => 'Tengerpartok',
        'advent' => 'Adventi barangolások',
        'osztalykirandulas' => 'Osztálykirándulások',
        // A legacy admin region, shown on the new site as a category.
        'repulos-utak' => 'Repülős körutazások',
    ];

    private const TRANSPORT_CODES = ['bus', 'plane', 'train'];

    public function __construct(private readonly LegacyBookingOptionsParser $bookingOptionsParser = new LegacyBookingOptionsParser) {}

    /**
     * Legacy ids of the bookable dates, used to fetch their booking options.
     *
     * @return array<int, int>
     */
    public function legacyDateIds(string $html): array
    {
        $xpath = new DOMXPath($this->loadDocument($html));
        $ids = [];

        foreach ($xpath->query('//table[contains(@class,"hotels-details-inner-dates")]//*[@data-date-id]') as $node) {
            $id = (int) $node->getAttribute('data-date-id');

            if ($id > 0) {
                $ids[] = $id;
            }
        }

        return array_values(array_unique($ids));
    }

    /**
     * @param  array{countries?: array<int, string>, categories?: array<int, string>}  $context
     * @param  array<int, array{options: array<string, mixed>, quote: array<string, mixed>}>  $bookingOptions  raw legacy booking data keyed by legacy date id
     */
    public function parse(string $html, string $sourceUrl, array $context = [], array $bookingOptions = []): LegacyOfferData
    {
        $document = $this->loadDocument($html);
        $xpath = new DOMXPath($document);

        $name = $this->firstText($xpath, '//h1');
        $seoName = $this->seoNameFromUrl($sourceUrl);
        $parsedOptions = array_map(
            fn (array $response): array => $this->bookingOptionsParser->parse($response['options'], $response['quote'] ?? []),
            $bookingOptions,
        );
        $dates = $this->extractDates($xpath, $parsedOptions);
        $program = $this->extractProgramParagraphs($xpath);
        $bookableDeparturePlaces = collect($parsedOptions)
            ->flatMap(fn (array $options): array => array_column($options['departurePlaces'], 'name'))
            ->unique()
            ->values()
            ->all();
        $datePrices = array_values(array_filter(array_column($dates, 'price'), fn (?float $price): bool => $price !== null));
        $onSiteFees = collect($parsedOptions)
            ->flatMap(fn (array $options): array => $options['onSiteFees'])
            ->unique()
            ->map(fn (string $fee): array => ['type' => 'excluded', 'text' => $fee])
            ->values()
            ->all();

        return new LegacyOfferData(
            sourceUrl: $sourceUrl,
            seoName: $seoName,
            name: $name !== '' ? $name : $seoName,
            shortDescription: $this->extractShortDescription($xpath),
            galleryImageUrls: $this->extractGalleryImageUrls($xpath, $sourceUrl),
            dates: $dates,
            programDays: $program['days'],
            priceItems: [...$program['priceItems'], ...$onSiteFees],
            tags: $this->extractKeywords($xpath),
            categories: $this->extractCategories($context),
            countrySlugs: array_values(array_unique($context['countries'] ?? [])),
            travelModeCode: $dates[0]['transport_code'] ?? null,
            catering: $dates[0]['catering'] ?? null,
            accommodation: $dates[0]['accommodation'] ?? null,
            departurePlaceNames: $bookableDeparturePlaces !== [] ? $bookableDeparturePlaces : $program['departurePlaces'],
            departurePlaceFees: $this->departurePlaceFees($dates, $parsedOptions),
            notesHtml: $program['notesHtml'],
            discountsHtml: $program['discountsHtml'],
            price: $datePrices !== [] ? min($datePrices) : $program['price'],
        );
    }

    private function extractShortDescription(DOMXPath $xpath): ?string
    {
        foreach ($xpath->query('//div[contains(@class,"header-content-inner")]//p') as $node) {
            $text = $this->normalizeWhitespace($node->textContent);

            if ($text !== '') {
                return $text;
            }
        }

        return null;
    }

    /**
     * @return array<int, string>
     */
    private function extractGalleryImageUrls(DOMXPath $xpath, string $sourceUrl): array
    {
        $base = $this->baseUrl($xpath, $sourceUrl);
        $urls = [];

        foreach ($xpath->query('//div[@id="sync1"]//a[@href]') as $node) {
            $original = $this->originalImagePath(trim($node->getAttribute('href')));

            if ($original !== null) {
                $urls[] = rtrim($base, '/').'/'.ltrim($original, '/');
            }
        }

        return array_values(array_unique($urls));
    }

    private function originalImagePath(string $href): ?string
    {
        if ($href === '') {
            return null;
        }

        $query = parse_url($href, PHP_URL_QUERY);

        if ($query === null || $query === false) {
            return $href;
        }

        parse_str($query, $params);

        return is_string($params['p'] ?? null) && $params['p'] !== '' ? $params['p'] : null;
    }

    private function baseUrl(DOMXPath $xpath, string $sourceUrl): string
    {
        $base = $xpath->query('//base[@href]')->item(0);

        if ($base instanceof DOMElement) {
            $href = trim($base->getAttribute('href'));

            if ($href !== '') {
                return rtrim($href, '/');
            }
        }

        $parts = parse_url($sourceUrl);

        return sprintf('%s://%s', $parts['scheme'] ?? 'https', $parts['host'] ?? '');
    }

    /**
     * @param  array<int, array{departurePlaces: array<int, array{name: string, price: float|null}>, extras: array<int, array{name: string, price: float, price_unit: string, charge_rule: string, choices: array<int, string>}>, lastMinutePercent: float|null}>  $bookingOptions
     * @return array<int, array{legacy_id: ?int, start_date: ?string, end_date: ?string, price: ?float, original_price: ?float, label: ?string, sold_out: bool, transport_code: ?string, catering: ?string, accommodation: ?string, extras: ?array<int, array{name: string, price: float, price_unit: string, charge_rule: string, choices: array<int, string>}>, discount_badge: ?string}>
     */
    private function extractDates(DOMXPath $xpath, array $bookingOptions): array
    {
        $table = $xpath->query('//table[contains(@class,"hotels-details-inner-dates")]')->item(0);

        if (! $table instanceof DOMElement) {
            return [];
        }

        $dates = [];

        foreach ($xpath->query('.//tr[td]', $table) as $row) {
            $cells = iterator_to_array($xpath->query('./td', $row));

            if (count($cells) < 5) {
                continue;
            }

            [$startDate, $endDate] = $this->parseDateRange($this->normalizeWhitespace($cells[0]->textContent));
            $prices = $this->parsePrices($cells[4]->textContent);
            $label = $this->priceLabel($xpath, $cells[4]);
            $isSoldOut = $label !== null && Str::contains(Str::lower($label), 'betelt');
            $legacyIdNode = $xpath->query('.//*[@data-date-id]', $row)->item(0);
            $legacyId = $legacyIdNode instanceof DOMElement ? (int) $legacyIdNode->getAttribute('data-date-id') : null;

            $dates[] = [
                'legacy_id' => $legacyId ?: null,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'price' => $prices !== [] ? end($prices) : null,
                'original_price' => count($prices) > 1 && $prices[0] > end($prices) ? $prices[0] : null,
                'label' => $isSoldOut ? null : $label,
                'sold_out' => $isSoldOut,
                'transport_code' => $this->extractTransportCode($xpath, $cells[1]),
                'catering' => $this->cellLabel($xpath, $cells[2]),
                'accommodation' => $this->cellLabel($xpath, $cells[3]),
                // A date without a legacy id is closed for booking: its extras are unknown, not none.
                'extras' => $legacyId ? ($bookingOptions[$legacyId]['extras'] ?? []) : null,
                'discount_badge' => $legacyId && isset($bookingOptions[$legacyId]['lastMinutePercent'])
                    ? '-'.rtrim(rtrim(number_format($bookingOptions[$legacyId]['lastMinutePercent'], 2, ',', ''), '0'), ',').'%'
                    : null,
            ];
        }

        return $dates;
    }

    /**
     * The legacy booking form prices each departure place per date; a place
     * costing more than the date's price (e.g. "Budapest BOK csarnok") carries
     * the difference as its per-tour fee.
     *
     * @param  array<int, array{legacy_id: ?int, price: ?float}>  $dates
     * @param  array<int, array{departurePlaces: array<int, array{name: string, price: float|null}>}>  $bookingOptions
     * @return array<string, float> fee per passenger keyed by departure place name
     */
    private function departurePlaceFees(array $dates, array $bookingOptions): array
    {
        $fees = [];

        foreach ($dates as $date) {
            if ($date['legacy_id'] === null || $date['price'] === null) {
                continue;
            }

            foreach ($bookingOptions[$date['legacy_id']]['departurePlaces'] ?? [] as $place) {
                $fee = ($place['price'] ?? $date['price']) - $date['price'];

                if ($fee > 0) {
                    $fees[$place['name']] = max($fees[$place['name']] ?? 0.0, $fee);
                }
            }
        }

        return $fees;
    }

    /**
     * Parses "2026.09.25. - 2026.10.01.", "2027.05.01. - 04." and
     * "2026.10.30. - 11.02." (the end omits the parts equal to the start).
     *
     * @return array{0: ?string, 1: ?string}
     */
    private function parseDateRange(string $text): array
    {
        if (! preg_match('/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?(?:\s*-\s*(?:(\d{4})\.\s*)?(?:(\d{1,2})\.\s*)?(\d{1,2})\.?)?/u', $text, $match)) {
            return [null, null];
        }

        [$startYear, $startMonth, $startDay] = [(int) $match[1], (int) $match[2], (int) $match[3]];
        $start = $this->isoDate($startYear, $startMonth, $startDay);

        if (($match[6] ?? '') === '') {
            return [$start, $start];
        }

        $endMonth = ($match[5] ?? '') !== '' ? (int) $match[5] : $startMonth;
        $endYear = ($match[4] ?? '') !== '' ? (int) $match[4] : ($endMonth < $startMonth ? $startYear + 1 : $startYear);

        return [$start, $this->isoDate($endYear, $endMonth, (int) $match[6]) ?? $start];
    }

    private function isoDate(int $year, int $month, int $day): ?string
    {
        return checkdate($month, $day, $year) ? sprintf('%04d-%02d-%02d', $year, $month, $day) : null;
    }

    /**
     * All prices in a price cell, in order: a discounted date shows the
     * struck-through original first and the current (bookable) price last.
     *
     * @return array<int, float>
     */
    private function parsePrices(string $text): array
    {
        preg_match_all('/(\d{1,3}(?:\.\d{3})+|\d+)\s*,-\s*Ft/u', $text, $matches);

        return array_map(fn (string $amount): float => (float) str_replace('.', '', $amount), $matches[1]);
    }

    /**
     * The note under a date's price ("Előfoglalási akció", "Őszi szünet",
     * "Betelt!"): the price cell's visible text besides its prices.
     */
    private function priceLabel(DOMXPath $xpath, DOMElement $cell): ?string
    {
        $visible = $xpath->query('.//div[@role="button"]/div[1]', $cell)->item(0) ?? $cell;
        $text = (string) preg_replace('/(\d{1,3}(?:\.\d{3})+|\d+)\s*,-\s*Ft(\/fő)?(-tól|-től)?/u', ' ', $visible->textContent);

        return $this->nullableText($text);
    }

    /**
     * The visible label of a catering/accommodation cell, without the hidden
     * popover explanation rendered next to it.
     */
    private function cellLabel(DOMXPath $xpath, DOMElement $cell): ?string
    {
        $label = $xpath->query('.//*[contains(@class,"popover-info")]//span', $cell)->item(0);

        return $this->nullableText($label !== null ? $label->textContent : $cell->textContent);
    }

    private function extractTransportCode(DOMXPath $xpath, DOMElement $cell): ?string
    {
        $icon = $xpath->query('.//i[contains(@class,"fa-")]', $cell)->item(0);

        if (! $icon instanceof DOMElement) {
            return null;
        }

        foreach (explode(' ', $icon->getAttribute('class')) as $class) {
            $code = Str::after(trim($class), 'fa-');

            if (in_array($code, self::TRANSPORT_CODES, true)) {
                return $code;
            }
        }

        return null;
    }

    /**
     * @return array<int, string>
     */
    private function extractKeywords(DOMXPath $xpath): array
    {
        $node = $xpath->query('//meta[@name="keywords"]')->item(0);

        if (! $node instanceof DOMElement) {
            return [];
        }

        return collect(explode(',', $node->getAttribute('content')))
            ->map(fn (string $tag): string => $this->normalizeWhitespace($tag))
            ->filter(fn (string $tag): bool => mb_strlen($tag) >= 2)
            ->unique(fn (string $tag): string => Str::lower($tag))
            ->values()
            ->all();
    }

    /**
     * Categories come only from the crawl context: the offer page's breadcrumb
     * links a single country, never the tour group the offer is listed in.
     *
     * @param  array{countries?: array<int, string>, categories?: array<int, string>}  $context
     * @return array<int, string>
     */
    private function extractCategories(array $context): array
    {
        return collect($context['categories'] ?? [])
            ->map(fn (string $slug): string => self::CATEGORY_NAMES[$slug] ?? Str::headline($slug))
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @return array{days: array<int, array{day_number: int, title: string, description: string}>, priceItems: array<int, array{type: string, text: string}>, departurePlaces: array<int, string>, notesHtml: ?string, discountsHtml: ?string, price: ?float}
     */
    private function extractProgramParagraphs(DOMXPath $xpath): array
    {
        $container = $xpath->query('//div[contains(@class,"program-content")]')->item(0);

        return LegacyOfferProgramReader::read($container instanceof DOMElement ? $container : null);
    }

    private function nullableText(string $text): ?string
    {
        $normalized = $this->normalizeWhitespace($text);

        return $normalized === '' ? null : $normalized;
    }

    private function normalizeWhitespace(string $text): string
    {
        return trim((string) preg_replace('/\s+/u', ' ', $text));
    }

    private function firstText(DOMXPath $xpath, string $query): string
    {
        $node = $xpath->query($query)->item(0);

        return $node ? $this->normalizeWhitespace($node->textContent) : '';
    }

    /**
     * The last path segment of the offer URL. parse_url() is avoided because
     * it mangles multibyte characters (legacy slugs may contain e.g. "–").
     */
    private function seoNameFromUrl(string $url): string
    {
        $path = trim((string) preg_replace('/[?#].*$/s', '', $url), '/');

        return rawurldecode(Str::afterLast($path, '/'));
    }

    private function loadDocument(string $html): DOMDocument
    {
        $document = new DOMDocument;
        $previous = libxml_use_internal_errors(true);
        $document->loadHTML('<?xml encoding="UTF-8">'.$html);
        libxml_clear_errors();
        libxml_use_internal_errors($previous);

        return $document;
    }
}
