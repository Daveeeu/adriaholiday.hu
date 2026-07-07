<?php

namespace App\Services\Legacy;

use App\Support\Legacy\LegacyOfferData;
use App\Support\RichTextSanitizer;
use DOMDocument;
use DOMElement;
use DOMXPath;
use Illuminate\Support\Str;

/**
 * Pure HTML -> data parser for a single legacy adriaholiday.hu offer detail page.
 * No I/O: takes the already-fetched HTML and returns a LegacyOfferData DTO.
 *
 * The offer page has no structured "program days" / "price includes" / "notes"
 * sections — they are all just <p> blocks inside one rich-text tab, so this
 * parser classifies each paragraph by its leading text pattern instead of by
 * CSS selector.
 */
class LegacyAdriaOfferParser
{
    private const CATEGORY_NAMES = [
        'korutazas' => 'Körutazás',
        'tengerparti-udulesek' => 'Tengerparti üdülések',
    ];

    private const TRANSPORT_CODES = ['bus', 'plane', 'train'];

    /**
     * @param  array{countries?: array<int, string>, categories?: array<int, string>}  $context
     */
    public function parse(string $html, string $sourceUrl, array $context = []): LegacyOfferData
    {
        $document = $this->loadDocument($html);
        $xpath = new DOMXPath($document);

        $name = $this->firstText($xpath, '//h1');
        $seoName = $this->seoNameFromUrl($sourceUrl);
        $dates = $this->extractDates($xpath);
        $program = $this->extractProgramParagraphs($xpath);

        return new LegacyOfferData(
            sourceUrl: $sourceUrl,
            seoName: $seoName,
            name: $name !== '' ? $name : $seoName,
            shortDescription: $this->extractShortDescription($xpath),
            galleryImageUrls: $this->extractGalleryImageUrls($xpath, $sourceUrl),
            dates: $dates,
            programDays: $program['days'],
            priceItems: $program['priceItems'],
            tags: $this->extractKeywords($xpath),
            categories: $this->extractCategories($xpath, $context),
            countrySlugs: array_values(array_unique($context['countries'] ?? [])),
            travelModeCode: $dates[0]['transport_code'] ?? null,
            catering: $dates[0]['catering'] ?? null,
            accommodation: $dates[0]['accommodation'] ?? null,
            departurePlaceNames: $program['departurePlaces'],
            notesHtml: $program['notesHtml'],
            discountsHtml: $program['discountsHtml'],
            price: $dates[0]['price'] ?? $program['price'] ?? null,
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
     * @return array<int, array{start_date: ?string, end_date: ?string, price: ?float, transport_code: ?string, catering: ?string, accommodation: ?string}>
     */
    private function extractDates(DOMXPath $xpath): array
    {
        $table = $xpath->query('//table[contains(@class,"hotels-details-inner-dates")]')->item(0);

        if (! $table instanceof DOMElement) {
            return [];
        }

        $dates = [];

        foreach ($xpath->query('.//tr[td]', $table) as $row) {
            $cells = iterator_to_array($xpath->query('.//td', $row));

            if (count($cells) < 5) {
                continue;
            }

            [$startDate, $endDate] = $this->parseDateRange($this->normalizeWhitespace($cells[0]->textContent));

            $dates[] = [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'price' => $this->parsePrice($cells[4]->textContent),
                'transport_code' => $this->extractTransportCode($xpath, $cells[1]),
                'catering' => $this->nullableText($cells[2]->textContent),
                'accommodation' => $this->nullableText($cells[3]->textContent),
            ];
        }

        return $dates;
    }

    /**
     * @return array{0: ?string, 1: ?string}
     */
    private function parseDateRange(string $text): array
    {
        preg_match_all('/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.?/u', $text, $matches, PREG_SET_ORDER);

        $isoDates = array_map(
            fn (array $match): string => sprintf('%04d-%02d-%02d', (int) $match[1], (int) $match[2], (int) $match[3]),
            $matches,
        );

        return [$isoDates[0] ?? null, $isoDates[1] ?? ($isoDates[0] ?? null)];
    }

    private function parsePrice(string $text): ?float
    {
        if (! preg_match('/(\d{1,3}(?:\.\d{3})*)/u', $text, $match)) {
            return null;
        }

        $digits = str_replace('.', '', $match[1]);

        return $digits === '' ? null : (float) $digits;
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
     * @param  array{countries?: array<int, string>, categories?: array<int, string>}  $context
     * @return array<int, string>
     */
    private function extractCategories(DOMXPath $xpath, array $context): array
    {
        $slugs = $context['categories'] ?? [];

        if ($slugs !== []) {
            return collect($slugs)
                ->map(fn (string $slug): string => self::CATEGORY_NAMES[$slug] ?? Str::headline($slug))
                ->unique()
                ->values()
                ->all();
        }

        $links = $xpath->query('//div[contains(concat(" ", normalize-space(@class), " "), " breadcrumb ")]/a[contains(@class,"section")]');

        if ($links->length < 2) {
            return [];
        }

        $lastLink = $links->item($links->length - 1);
        $label = $lastLink instanceof DOMElement ? $this->normalizeWhitespace($lastLink->textContent) : '';

        return $label !== '' && ! in_array($label, ['Főoldal', 'Körutazások'], true) ? [$label] : [];
    }

    /**
     * @return array{days: array<int, array{day_number: int, title: string, description: string}>, priceItems: array<int, array{type: string, text: string}>, departurePlaces: array<int, string>, notesHtml: ?string, discountsHtml: ?string, price: ?float}
     */
    private function extractProgramParagraphs(DOMXPath $xpath): array
    {
        $container = $xpath->query('//div[contains(@class,"program-content")]')->item(0);

        $days = [];
        $priceItems = [];
        $departurePlaces = [];
        $notesParts = [];
        $discountsParts = [];
        $priceFromText = null;

        if ($container instanceof DOMElement) {
            foreach ($container->childNodes as $node) {
                if (! $node instanceof DOMElement || strtolower($node->tagName) !== 'p') {
                    continue;
                }

                $lines = $this->paragraphLines($node);
                $first = $lines[0] ?? '';

                if ($first === '') {
                    continue;
                }

                if (preg_match('/^(\d{1,2})\.\s*NAP\.?\s*(.*)$/iu', $first, $match)) {
                    $title = trim($match[2]) !== '' ? trim($match[2]) : $first;
                    $days[] = [
                        'day_number' => (int) $match[1],
                        'title' => $title,
                        'description' => implode(' ', array_slice($lines, 1)),
                    ];

                    continue;
                }

                if ($this->containsCi($first, 'ár tartalmazza')) {
                    foreach (array_slice($lines, 1) as $line) {
                        $text = $this->stripBullet($line);

                        if ($text !== '') {
                            $priceItems[] = ['type' => 'included', 'text' => $text];
                        }
                    }

                    continue;
                }

                if ($this->containsCi($first, 'további költségek') || $this->containsCi($first, 'nem tartalmazza')) {
                    foreach (array_slice($lines, 1) as $line) {
                        $text = $this->stripBullet($line);

                        if ($text !== '') {
                            $priceItems[] = ['type' => 'excluded', 'text' => $text];
                        }
                    }

                    continue;
                }

                if ($this->containsCi($first, 'csatlakozási lehetőségek')) {
                    $rest = implode(' ', $lines);
                    $afterColon = Str::contains($rest, ':') ? Str::after($rest, ':') : $rest;
                    $departurePlaces = collect(explode(',', $afterColon))
                        ->map(fn (string $place): string => trim($place))
                        ->filter(fn (string $place): bool => $place !== '')
                        ->values()
                        ->all();

                    continue;
                }

                if ($this->containsCi($first, 'részvételi díj')) {
                    $priceFromText = $this->parsePrice($first);

                    continue;
                }

                if ($this->containsCi($first, 'kedvezmény')) {
                    $discountsParts[] = $this->sanitizeParagraph($node);

                    continue;
                }

                $notesParts[] = $this->sanitizeParagraph($node);
            }
        }

        return [
            'days' => $days,
            'priceItems' => $priceItems,
            'departurePlaces' => $departurePlaces,
            'notesHtml' => $notesParts !== [] ? implode("\n", $notesParts) : null,
            'discountsHtml' => $discountsParts !== [] ? implode("\n", $discountsParts) : null,
            'price' => $priceFromText,
        ];
    }

    /**
     * @return array<int, string>
     */
    private function paragraphLines(DOMElement $node): array
    {
        $html = $node->ownerDocument?->saveHTML($node) ?: '';
        $html = (string) preg_replace('/<br\s*\/?>/i', "\n", $html);
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        $lines = array_map(fn (string $line): string => $this->normalizeWhitespace($line), explode("\n", $text));

        return array_values(array_filter($lines, fn (string $line): bool => $line !== ''));
    }

    private function sanitizeParagraph(DOMElement $node): string
    {
        $html = $node->ownerDocument?->saveHTML($node) ?: '';

        return (string) RichTextSanitizer::sanitize($html);
    }

    private function stripBullet(string $line): string
    {
        return trim((string) preg_replace('/^[-•–]\s*/u', '', $line));
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

    private function containsCi(string $haystack, string $needle): bool
    {
        return Str::contains(Str::lower($haystack), Str::lower($needle));
    }

    private function firstText(DOMXPath $xpath, string $query): string
    {
        $node = $xpath->query($query)->item(0);

        return $node ? $this->normalizeWhitespace($node->textContent) : '';
    }

    private function seoNameFromUrl(string $url): string
    {
        $path = trim((string) parse_url($url, PHP_URL_PATH), '/');
        $segments = explode('/', $path);

        return (string) end($segments);
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
