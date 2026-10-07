<?php

namespace App\Services\Legacy;

use DOMDocument;
use DOMXPath;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

/**
 * Discovers offer detail URLs on the legacy adriaholiday.hu site and fetches
 * raw HTML and per-date booking options, with a rate-limited, identified HTTP client (no sitemap/API exists
 * on the legacy site, so discovery walks the tour group listing pages linked from the home page and
 * their per-country sub-pages).
 */
class LegacyAdriaOfferCrawler
{
    private const GROUP_PATH_PREFIX = 'korutazasok/csoport/';

    private readonly string $baseUrl;

    private readonly string $userAgent;

    private readonly int $timeout;

    private readonly int $delayMs;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.legacy_adria.base_url'), '/');
        $this->userAgent = (string) config('services.legacy_adria.user_agent');
        $this->timeout = (int) config('services.legacy_adria.timeout');
        $this->delayMs = (int) config('services.legacy_adria.request_delay_ms');
    }

    /**
     * @return array<string, array{countries: array<int, string>, categories: array<int, string>}>
     */
    public function discoverOfferUrls(): array
    {
        $offers = [];

        foreach ($this->discoverIndexPaths() as $indexPath => $context) {
            try {
                $html = $this->fetchHtml($this->resolveUrl($indexPath));
            } catch (LegacyFetchException $exception) {
                report($exception);

                continue;
            }

            foreach ($this->extractOfferPaths($html) as $offerPath) {
                $url = $this->resolveUrl($offerPath);
                $offers[$url]['countries'] = array_values(array_unique([
                    ...($offers[$url]['countries'] ?? []),
                    ...$context['countries'],
                ]));
                $offers[$url]['categories'] = array_values(array_unique([
                    ...($offers[$url]['categories'] ?? []),
                    ...$context['categories'],
                ]));
            }
        }

        return $offers;
    }

    /**
     * The crawl context (countries, categories) of the given offers, found in
     * one walk of the same listing pages as discoverOfferUrls(): the offer
     * page itself only names a single country in its breadcrumb and never its
     * tour group. An offer missing from every listing page gets an empty one.
     *
     * @param  array<int, string>  $offerUrls
     * @return array<string, array{countries: array<int, string>, categories: array<int, string>}> keyed by the given URL
     */
    public function discoverOfferContexts(array $offerUrls): array
    {
        $listed = [];

        foreach ($this->discoverOfferUrls() as $url => $context) {
            $listed[rawurldecode($url)] = $context;
        }

        $contexts = [];

        foreach ($offerUrls as $offerUrl) {
            $contexts[$offerUrl] = $listed[rawurldecode($offerUrl)] ?? ['countries' => [], 'categories' => []];
        }

        return $contexts;
    }

    public function offerUrlForSlug(string $slug): string
    {
        return $this->resolveUrl('korutazasok/'.trim($slug, '/'));
    }

    /**
     * Fetches, per tour date, the booking options the legacy booking form
     * loads (departure places, extras) and a one-passenger price quote,
     * which carries the resort fee and the Last Minute discount.
     *
     * @param  array<int, int>  $legacyDateIds
     * @return array<int, array{options: array<string, mixed>, quote: array<string, mixed>}> keyed by legacy date id
     *
     * @throws LegacyFetchException
     */
    public function fetchBookingOptions(array $legacyDateIds): array
    {
        $bookingOptions = [];

        foreach ($legacyDateIds as $legacyDateId) {
            $options = $this->fetchJson('roundtrip/get_datas', ['offer_date_id' => $legacyDateId]);
            preg_match('/<option value="?(\d+)"?>/', (string) ($options['felszallas_items'] ?? ''), $departure);

            $bookingOptions[$legacyDateId] = [
                'options' => $options,
                'quote' => $this->fetchJson('roundtrip/get_roundtrip_price', [
                    'offer_date_id' => $legacyDateId,
                    'reservation_felszallas' => $departure[1] ?? '',
                    'reservation_person' => 1,
                    'reservation_resort_fee' => 1,
                    'reservation_resort_fee_eur' => 1,
                    'reservation_last_minute' => 1,
                    // The legacy endpoint emits PHP notices instead of JSON when any field of its form is missing.
                    'reservation_online_discount' => 0,
                    'travel_insurance_eub' => 0,
                    'cancellation_insurance_eub' => 0,
                    'travel_email_coupon' => 0,
                    'travel_email_coupon_code' => '',
                ]),
            ];
        }

        return $bookingOptions;
    }

    /**
     * @param  array<string, int|string>  $query
     * @return array<string, mixed>
     *
     * @throws LegacyFetchException
     */
    private function fetchJson(string $path, array $query): array
    {
        $url = $this->resolveUrl($path.'?'.http_build_query($query));
        $decoded = json_decode($this->fetchHtml($url), true);

        if (! is_array($decoded)) {
            throw new LegacyFetchException("Invalid JSON response from {$url}");
        }

        return $decoded;
    }

    /**
     * @throws LegacyFetchException
     */
    public function fetchHtml(string $url): string
    {
        $this->throttle();

        try {
            $response = Http::withUserAgent($this->userAgent)
                ->timeout($this->timeout)
                ->retry(2, 500)
                ->get($url);
        } catch (Throwable $exception) {
            throw new LegacyFetchException("Failed to fetch {$url}: {$exception->getMessage()}", previous: $exception);
        }

        if ($response->failed()) {
            throw new LegacyFetchException("Failed to fetch {$url}: HTTP {$response->status()}");
        }

        return $response->body();
    }

    /**
     * @return array<string, array{countries: array<int, string>, categories: array<int, string>}>
     */
    private function discoverIndexPaths(): array
    {
        $paths = [];

        foreach ($this->discoverGroupSlugs() as $category) {
            $rootPath = self::GROUP_PATH_PREFIX.$category;

            try {
                $rootHtml = $this->fetchHtml($this->resolveUrl($rootPath));
            } catch (LegacyFetchException $exception) {
                report($exception);

                continue;
            }

            foreach ($this->extractCountrySlugs($rootHtml, $rootPath.'/') as $countrySlug) {
                $paths["{$rootPath}/{$countrySlug}"] = [
                    'countries' => [$countrySlug],
                    'categories' => [$category],
                ];
            }
        }

        return $paths;
    }

    /**
     * Slugs of the tour groups (e.g. "korutazas", "advent") the home page links to; every offer
     * gets the groups whose listing pages it appears on as its categories.
     *
     * @return array<int, string>
     */
    private function discoverGroupSlugs(): array
    {
        try {
            $homeHtml = $this->fetchHtml($this->resolveUrl(''));
        } catch (LegacyFetchException $exception) {
            report($exception);

            return [];
        }

        $xpath = new DOMXPath($this->loadDocument($homeHtml));
        $slugs = [];

        foreach ($xpath->query('//a[@href]') as $node) {
            $path = $this->sitePath($node->getAttribute('href'));

            if (! Str::startsWith($path, self::GROUP_PATH_PREFIX)) {
                continue;
            }

            $slug = trim(Str::after($path, self::GROUP_PATH_PREFIX), '/');

            if ($slug !== '' && ! Str::contains($slug, '/')) {
                $slugs[] = $slug;
            }
        }

        return array_values(array_unique($slugs));
    }

    /**
     * A link's path relative to the legacy site root; the site mixes relative links with
     * absolute ones on either scheme.
     */
    private function sitePath(string $href): string
    {
        $href = trim($href);
        $host = (string) parse_url($this->baseUrl, PHP_URL_HOST);

        if ($host !== '' && preg_match('#^(?:https?:)?//'.preg_quote($host, '#').'(?=/|$)#i', $href, $match)) {
            $href = substr($href, strlen($match[0]));
        }

        return ltrim($href, '/');
    }

    /**
     * @return array<int, string>
     */
    private function extractCountrySlugs(string $html, string $prefix): array
    {
        $document = $this->loadDocument($html);
        $xpath = new DOMXPath($document);

        $slugs = [];

        foreach ($xpath->query('//a[@href]') as $node) {
            $href = ltrim(trim($node->getAttribute('href')), '/');

            if (! Str::startsWith($href, $prefix)) {
                continue;
            }

            $slug = trim(Str::after($href, $prefix), '/');

            if ($slug !== '' && ! Str::contains($slug, '/')) {
                $slugs[] = $slug;
            }
        }

        return array_values(array_unique($slugs));
    }

    /**
     * @return array<int, string>
     */
    private function extractOfferPaths(string $html): array
    {
        $document = $this->loadDocument($html);
        $xpath = new DOMXPath($document);

        $paths = [];

        foreach ($xpath->query('//div[contains(concat(" ", normalize-space(@class), " "), " item ")]//a[@href]') as $node) {
            $href = ltrim(trim($node->getAttribute('href')), '/');

            if ($href === '' || ! Str::startsWith($href, 'korutazasok/') || Str::contains($href, ['csoport', 'regio', 'akcio'])) {
                continue;
            }

            $paths[] = $href;
        }

        return array_values(array_unique($paths));
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

    private function resolveUrl(string $path): string
    {
        return $this->baseUrl.'/'.ltrim($path, '/');
    }

    private function throttle(): void
    {
        if ($this->delayMs > 0) {
            usleep($this->delayMs * 1000);
        }
    }
}
