<?php

namespace App\Http\Controllers;

use App\Models\BlogArticle;
use App\Models\HomepageOffer;
use App\Models\Region;
use App\Models\Tour;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $items = collect()
            ->merge($this->staticPages())
            ->merge($this->categoryPages())
            ->merge($this->regionPages())
            ->merge($this->offerPages())
            ->merge($this->blogPages())
            ->values();

        $xml = view('seo.sitemap', [
            'items' => $items,
        ])->render();

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    /**
     * @return Collection<int, array{loc: string, lastmod: string|null, changefreq: string, priority: string}>
     */
    private function staticPages(): Collection
    {
        $paths = [
            '/',
            '/utazasok',
            '/portfolio',
            '/blog',
            '/rolunk',
            '/kapcsolat',
            '/aszf',
            '/adatvedelem',
            '/impresszum',
            '/sutik',
        ];

        return collect($paths)->map(fn (string $path): array => [
            'loc' => $this->absoluteUrl($path),
            'lastmod' => now()->toDateString(),
            'changefreq' => $path === '/' ? 'daily' : 'weekly',
            'priority' => $path === '/' ? '1.0' : '0.7',
        ]);
    }

    /**
     * @return Collection<int, array{loc: string, lastmod: string|null, changefreq: string, priority: string}>
     */
    private function categoryPages(): Collection
    {
        return HomepageOffer::query()
            ->where('active', true)
            ->with('translations')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(function (HomepageOffer $offer): ?array {
                $translation = $offer->translations->firstWhere('locale', 'hu')
                    ?? $offer->translations->first();

                $path = $this->categoryPath($offer->link, $translation?->seo_name);

                if ($path === null) {
                    return null;
                }

                return [
                    'loc' => $this->absoluteUrl($path),
                    'lastmod' => $offer->updated_at?->toDateString(),
                    'changefreq' => 'weekly',
                    'priority' => '0.8',
                ];
            })
            ->filter()
            ->unique('loc')
            ->values();
    }

    /**
     * @return Collection<int, array{loc: string, lastmod: string|null, changefreq: string, priority: string}>
     */
    private function regionPages(): Collection
    {
        return Region::query()
            ->where('is_active', true)
            ->orderBy('portfolio_sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Region $region): array => [
                'loc' => $this->absoluteUrl("/regiok/{$region->slug}"),
                'lastmod' => $region->updated_at?->toDateString(),
                'changefreq' => 'weekly',
                'priority' => '0.7',
            ]);
    }

    /**
     * @return Collection<int, array{loc: string, lastmod: string|null, changefreq: string, priority: string}>
     */
    private function offerPages(): Collection
    {
        return Tour::query()
            ->where('active', true)
            ->whereNotNull('seo_name')
            ->orderByDesc('updated_at')
            ->get()
            ->map(fn (Tour $tour): array => [
                'loc' => $this->absoluteUrl("/ajanlat/{$tour->seo_name}"),
                'lastmod' => $tour->updated_at?->toDateString(),
                'changefreq' => 'weekly',
                'priority' => '0.9',
            ]);
    }

    /**
     * @return Collection<int, array{loc: string, lastmod: string|null, changefreq: string, priority: string}>
     */
    private function blogPages(): Collection
    {
        return BlogArticle::query()
            ->where('active', true)
            ->whereNotNull('published_at')
            ->with('translations')
            ->orderByDesc('published_at')
            ->get()
            ->map(function (BlogArticle $article): ?array {
                $translation = $article->translations->firstWhere('locale', 'hu')
                    ?? $article->translations->first();
                $slug = $translation?->seo_name
                    ?: Str::slug((string) ($translation?->title ?? $article->image_title));

                if ($slug === '') {
                    return null;
                }

                return [
                    'loc' => $this->absoluteUrl("/blog/{$slug}"),
                    'lastmod' => ($article->updated_at ?? $article->published_at)?->toDateString(),
                    'changefreq' => 'monthly',
                    'priority' => '0.7',
                ];
            })
            ->filter()
            ->values();
    }

    private function categoryPath(?string $link, ?string $fallbackSlug): ?string
    {
        $normalizedLink = trim((string) $link);

        if ($normalizedLink !== '') {
            $path = parse_url($normalizedLink, PHP_URL_PATH) ?: $normalizedLink;
            $path = '/'.ltrim($path, '/');

            if (str_starts_with($path, '/kategoriak/')) {
                return $path;
            }
        }

        $slug = trim((string) $fallbackSlug);

        return $slug !== '' ? "/kategoriak/{$slug}" : null;
    }

    private function absoluteUrl(string $path): string
    {
        $base = rtrim((string) config('app.url', 'https://adriaholiday.hu'), '/');

        return $base.($path === '/' ? '/' : '/'.ltrim($path, '/'));
    }
}
