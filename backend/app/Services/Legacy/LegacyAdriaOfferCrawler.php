<?php

namespace App\Services\Legacy;

use DOMDocument;
use DOMXPath;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Throwable;

/**
 * Discovers offer detail URLs on the legacy adriaholiday.hu site and fetches
 * raw HTML, with a rate-limited, identified HTTP client (no sitemap/API exists
 * on the legacy site, so discovery walks the two tour group listing pages and
 * their per-country sub-pages).
 */
class LegacyAdriaOfferCrawler
{
    /**
     * Tour group roots, each of which links to its own set of per-country pages.
     */
    private const GROUP_ROOTS = [
        'korutazasok/csoport/korutazas' => 'korutazas',
        'korutazasok/csoport/tengerparti-udulesek' => 'tengerparti-udulesek',
    ];

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

    public function offerUrlForSlug(string $slug): string
    {
        return $this->resolveUrl('korutazasok/'.trim($slug, '/'));
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

        foreach (self::GROUP_ROOTS as $rootPath => $category) {
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
