<?php

namespace App\Services\Seo;

use App\Models\BlogArticle;
use App\Models\BlogCategory;
use App\Models\HomepageOffer;
use App\Models\Region;
use App\Models\SiteSetting;
use App\Models\Tour;
use App\Support\CompanyContact;
use App\Support\Seo\PublicSiteUrl;
use App\Support\Seo\SeoPage;
use Illuminate\Support\Str;

/**
 * The SEO head of each public route, rendered into index.html by the server so
 * crawlers and link previews get the page's own title, description, canonical
 * URL and structured data, and unknown pages answer 404. It mirrors the titles
 * and descriptions the app's routes pass to their Seo component.
 */
class PortfolioSeoResolver
{
    private const DESCRIPTION_LENGTH = 160;

    /** Shared preview image (built with the app) when the settings give none. */
    private const DEFAULT_OG_IMAGE_PATH = '/portfolio/og-image.jpg';

    /**
     * @var array<string, array{0: string, 1: string}> path => [title, description]
     */
    private const STATIC_PAGES = [
        'utazasok' => ['Utazások', 'Válogass a legfrissebb ajánlataink közül, és találd meg a következő élményt.'],
        'blog' => ['Utazó Blog', 'Utazási inspirációk, tippek és történetek az Adria Holiday blogján.'],
        'rolunk' => ['Rólunk', 'Az Adria Holiday 2003 óta szervez európai kulturális körutazásokat és tengerparti nyaralásokat: gondosan kiválasztott szállások, felkészült idegenvezetők és újszerű autóbuszok.'],
        'rolunk-irtak' => ['Rólunk írták', 'Utasaink levelei és élménybeszámolói az Adria Holiday utazásairól.'],
        'kapcsolat' => ['Kapcsolat', 'Hívj, írj, vagy gyere be az irodába – segítünk megtalálni a következő utadat.'],
        'aszf' => ['Általános szerződési feltételek', 'Az Adria Holiday általános szerződési feltételei.'],
        'adatvedelem' => ['Adatvédelem', 'Az Adria Holiday adatkezelési tájékoztatója és adatvédelmi gyakorlata.'],
        'impresszum' => ['Impresszum', 'Az Adria Holiday szolgáltatói és üzemeltetői adatai.'],
        'sutik' => ['Sütikezelés', 'Tájékoztató az Adria Holiday oldalon használt sütikről és hozzájáruláskezelésről.'],
    ];

    /**
     * @var array<string, string>|null
     */
    private ?array $settings = null;

    public function siteName(): string
    {
        return $this->setting('general.site_name') ?: 'Adria Holiday';
    }

    public function resolve(string $path): SeoPage
    {
        $path = trim($path, '/');
        $segments = $path === '' ? [] : explode('/', $path);

        return match (true) {
            $segments === [] => $this->home(),
            count($segments) === 1 && isset(self::STATIC_PAGES[$segments[0]]) => $this->staticPage($segments[0]),
            $segments === ['fizetes', 'eredmeny'] => new SeoPage('Fizetés eredménye', 'Az online fizetés eredménye.', '/fizetes/eredmeny', noIndex: true),
            count($segments) === 2 && $segments[0] === 'ajanlat' => $this->offer($segments[1]),
            count($segments) === 2 && $segments[0] === 'blog' => $this->article($segments[1]),
            count($segments) === 2 && $segments[0] === 'kategoriak' => $this->category($segments[1]),
            count($segments) === 2 && $segments[0] === 'regiok' => $this->region($segments[1]),
            default => SeoPage::notFound('/'.$path),
        };
    }

    private function home(): SeoPage
    {
        $name = $this->siteName();

        return new SeoPage(
            title: $this->setting('seo.default_title') ?: $name,
            description: $this->setting('seo.default_description'),
            canonicalPath: '/',
            image: $this->defaultImage(),
            jsonLd: [
                array_filter([
                    '@context' => 'https://schema.org',
                    '@type' => 'TravelAgency',
                    'name' => $name,
                    'url' => PublicSiteUrl::to('/'),
                    'logo' => $this->setting('brand.logo'),
                    'email' => $this->setting('contact.email'),
                    'telephone' => $this->setting('contact.phone'),
                    'address' => $this->setting('contact.address'),
                    'foundingDate' => '2003',
                    'sameAs' => array_values(array_filter([$this->setting('social.facebook'), $this->setting('social.instagram'), $this->setting('social.tiktok')])),
                ]),
                ['@context' => 'https://schema.org', '@type' => 'WebSite', 'name' => $name, 'url' => PublicSiteUrl::to('/')],
            ],
        );
    }

    private function staticPage(string $slug): SeoPage
    {
        [$title, $description] = self::STATIC_PAGES[$slug];

        return new SeoPage($title, $description, "/{$slug}", image: $this->defaultImage(), jsonLd: [$this->breadcrumb([[$title, "/{$slug}"]])]);
    }

    private function offer(string $slug): SeoPage
    {
        $tour = Tour::query()->where('active', true)->where('seo_name', $slug)->first();

        if ($tour === null) {
            return SeoPage::notFound("/ajanlat/{$slug}");
        }

        $path = "/ajanlat/{$tour->seo_name}";
        $image = $tour->mainImage()?->getUrl();
        $description = $this->plain($tour->short_description) ?: $this->plain($tour->list_description) ?: $tour->name;

        return new SeoPage(
            title: $tour->name,
            description: $description,
            canonicalPath: $path,
            image: $image ?: $this->defaultImage(),
            ogType: 'product',
            jsonLd: [
                $this->breadcrumb([['Utazások', '/utazasok'], [$tour->name, $path]]),
                array_filter([
                    '@context' => 'https://schema.org',
                    '@type' => 'TouristTrip',
                    'name' => $tour->name,
                    'description' => $description,
                    'image' => $image ? [$image] : null,
                    'url' => PublicSiteUrl::to($path),
                    'provider' => ['@type' => 'TravelAgency', 'name' => $this->siteName(), 'url' => PublicSiteUrl::to('/')],
                    'offers' => $tour->price ? [
                        '@type' => 'Offer',
                        'price' => (float) $tour->price,
                        'priceCurrency' => 'HUF',
                        'availability' => 'https://schema.org/InStock',
                        'url' => PublicSiteUrl::to($path),
                    ] : null,
                ]),
            ],
        );
    }

    private function article(string $slug): SeoPage
    {
        $article = BlogArticle::query()
            ->where('active', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->whereHas('translations', fn ($query) => $query->where('seo_name', $slug))
            ->with('translations')
            ->first();

        if ($article === null) {
            return $this->legacyArticleRedirect($slug) ?? SeoPage::notFound("/blog/{$slug}");
        }

        $translation = $article->translations->firstWhere('seo_name', $slug);
        $title = (string) ($translation?->title ?: $article->image_title);
        $path = "/blog/{$slug}";
        $image = $this->absolute($article->getFirstMedia('cover')?->getUrl() ?: $article->image);
        $description = $this->plain($translation?->excerpt) ?: $this->plain($translation?->content) ?: $title;

        return new SeoPage(
            title: $title,
            description: $description,
            canonicalPath: $path,
            image: $image ?: $this->defaultImage(),
            ogType: 'article',
            jsonLd: [
                $this->breadcrumb([['Blog', '/blog'], [$title, $path]]),
                array_filter([
                    '@context' => 'https://schema.org',
                    '@type' => 'BlogPosting',
                    'headline' => Str::limit($title, 110, ''),
                    'description' => $description,
                    'image' => $image ? [$image] : null,
                    'datePublished' => $article->published_at?->toIso8601String(),
                    'dateModified' => $article->updated_at?->toIso8601String(),
                    'mainEntityOfPage' => PublicSiteUrl::to($path),
                    'author' => ['@type' => 'Organization', 'name' => $this->siteName()],
                    'publisher' => ['@type' => 'Organization', 'name' => $this->siteName()],
                ]),
            ],
        );
    }

    /**
     * Legacy post URLs carried the post id after the URL name ("…-27"); they move
     * to the URL without it.
     */
    private function legacyArticleRedirect(string $slug): ?SeoPage
    {
        if (! preg_match('/^(.+)-\d+$/', $slug, $match)) {
            return null;
        }

        $exists = BlogArticle::query()
            ->where('active', true)
            ->whereHas('translations', fn ($query) => $query->where('seo_name', $match[1]))
            ->exists();

        return $exists ? SeoPage::movedTo("/blog/{$match[1]}") : null;
    }

    private function category(string $slug): SeoPage
    {
        $category = BlogCategory::query()
            ->where('active', true)
            ->where(fn ($query) => $query->where('seo_name', $slug)->orWhereHas('translations', fn ($translations) => $translations->where('seo_name', $slug)))
            ->with('translations')
            ->first();

        if ($category === null) {
            return SeoPage::notFound("/kategoriak/{$slug}");
        }

        $card = HomepageOffer::query()->where('active', true)->where('link', "/kategoriak/{$slug}")->with('translations')->first();
        $cardTranslation = $card?->translations->firstWhere('locale', 'hu');
        $categoryTranslation = $category->translations->firstWhere('locale', 'hu');
        $title = (string) ($cardTranslation?->name ?: $categoryTranslation?->name ?: Str::headline($slug));
        $path = "/kategoriak/{$slug}";

        return new SeoPage(
            title: $title,
            description: $this->plain($cardTranslation?->short_description) ?: "{$title}: válogass az Adria Holiday aktuális ajánlatai közül.",
            canonicalPath: $path,
            image: $card?->getFirstMedia('image')?->getUrl() ?: $this->defaultImage(),
            jsonLd: [$this->breadcrumb([['Utazások', '/utazasok'], [$title, $path]])],
        );
    }

    private function region(string $slug): SeoPage
    {
        $region = Region::query()->where('is_active', true)->where('slug', $slug)->first();

        if ($region === null) {
            return SeoPage::notFound("/regiok/{$slug}");
        }

        $path = "/regiok/{$slug}";

        return new SeoPage(
            title: $region->name,
            description: $this->plain($region->description) ?: "{$region->name} utazási ajánlatok és régiós inspirációk.",
            canonicalPath: $path,
            image: $region->getFirstMedia('portfolio-image')?->getUrl() ?: $this->defaultImage(),
            jsonLd: [$this->breadcrumb([['Utazások', '/utazasok'], [$region->name, $path]])],
        );
    }

    /**
     * @param  array<int, array{0: string, 1: string}>  $trail  [name, path] after the home page
     * @return array<string, mixed>
     */
    private function breadcrumb(array $trail): array
    {
        $items = [['Főoldal', '/'], ...$trail];

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => array_map(fn (array $item, int $index): array => [
                '@type' => 'ListItem',
                'position' => $index + 1,
                'name' => $item[0],
                'item' => PublicSiteUrl::to($item[1]),
            ], $items, array_keys($items)),
        ];
    }

    private function absolute(?string $url): ?string
    {
        return $url !== null && str_starts_with($url, '/') ? PublicSiteUrl::to($url) : $url;
    }

    private function plain(?string $html): string
    {
        $text = trim((string) preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags((string) $html), ENT_QUOTES | ENT_HTML5, 'UTF-8')));

        return Str::limit($text, self::DESCRIPTION_LENGTH, '…', preserveWords: true);
    }

    private function defaultImage(): string
    {
        return $this->setting('seo.default_og_image') ?: PublicSiteUrl::to(self::DEFAULT_OG_IMAGE_PATH);
    }

    /**
     * A public site setting as text ("group.key"); media settings give their URL.
     */
    private function setting(string $key): string
    {
        if ($this->settings === null) {
            $this->settings = SiteSetting::query()->public()->get()
                ->mapWithKeys(function (SiteSetting $setting): array {
                    $value = $setting->decodedValue();
                    $text = is_array($value) ? ($value['url'] ?? '') : (string) ($value ?? '');

                    return ["{$setting->group}.{$setting->key}" => trim($text)];
                })
                ->all();
        }

        return $this->settings[$key] ?? match ($key) {
            'contact.email', 'contact.phone', 'contact.address' => CompanyContact::DEFAULTS[Str::after($key, '.')]['value'],
            default => '',
        };
    }
}
