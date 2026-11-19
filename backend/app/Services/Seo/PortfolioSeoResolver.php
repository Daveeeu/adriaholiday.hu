<?php

namespace App\Services\Seo;

use App\Models\Apartment;
use App\Models\BlogArticle;
use App\Models\BlogCategory;
use App\Models\HomepageOffer;
use App\Models\Location;
use App\Models\Page;
use App\Models\Region;
use App\Models\SiteSetting;
use App\Models\Tour;
use App\Models\TourDate;
use App\Services\PortfolioContent\PortfolioFaq;
use App\Support\CompanyContact;
use App\Support\CompanyYears;
use App\Support\Seo\OpeningHoursSpecification;
use App\Support\Seo\PublicSiteUrl;
use App\Support\Seo\RobotsDirective;
use App\Support\Seo\SeoBody;
use App\Support\Seo\SeoLink;
use App\Support\Seo\SeoLinkSection;
use App\Support\Seo\SeoPage;
use App\Support\Tour\TourDateStatus;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * The SEO head of each public route, rendered into index.html by the server so
 * crawlers and link previews get the page's own title, description, canonical
 * URL and structured data, and unknown pages answer 404. It mirrors the titles
 * and descriptions the app's routes pass to their Seo component. Each page also
 * carries its crawlable text and links (see SeoBody), closed by the site's
 * menu and the office's contact details.
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
        'kapcsolat' => ['Kapcsolat', 'Hívj, írj vagy gyere be hozzánk az irodába – segítünk megtalálni a következő utadat.'],
        'aszf' => ['Általános szerződési feltételek', 'Az Adria Holiday általános szerződési feltételei.'],
        'adatvedelem' => ['Adatvédelem', 'Az Adria Holiday adatkezelési tájékoztatója és adatvédelmi gyakorlata.'],
        'impresszum' => ['Impresszum', 'Az Adria Holiday szolgáltatói és üzemeltetői adatai.'],
        'sutik' => ['Sütikezelés', 'Tájékoztató az Adria Holiday oldalon használt sütikről és hozzájáruláskezelésről.'],
        'biztositasok' => ['Biztosítások', 'Az Adria Holiday utazásaihoz köthető ALFA Compass utas- és útlemondási biztosítás díjai, szolgáltatásai és termékismertetője.'],
        'utazasi-klub' => ['Utazási Klub', 'Iratkozz fel az Adria Holiday hírlevelére: folyamatos akciók, egyedi ajánlatok és ajándék kedvezménykupon az első foglalásodhoz.'],
        'adria-holiday-utazasi-klub-felhasznalasi-feltetelei' => ['Az Utazási Klub felhasználási feltételei', 'Az Adria Holiday Utazási Klub és a hírlevél-feliratkozáskor kapott kedvezménykupon felhasználási feltételei.'],
    ];

    /**
     * @var array<string, string>|null
     */
    private ?array $settings = null;

    /**
     * The site's main pages, linked from every page: the header's menu and the blog.
     *
     * @var array<int, array{0: string, 1: string}> [name, path]
     */
    private const MENU = [
        ['Főoldal', '/'],
        ['Utazások', '/utazasok'],
        ['Rólunk', '/rolunk'],
        ['Utazási Klub', '/utazasi-klub'],
        ['Utazó Blog', '/blog'],
        ['Kapcsolat', '/kapcsolat'],
    ];

    public function __construct(
        private readonly SeoRedirectResolver $redirects,
        private readonly RetiredContentRedirects $retiredContent,
        private readonly PortfolioSeoBodies $bodies,
        private readonly PortfolioFaq $faq,
    ) {}

    public function siteName(): string
    {
        return $this->setting('general.site_name') ?: 'Adria Holiday';
    }

    public function resolve(string $path): SeoPage
    {
        // Links and crawlers often percent-encode the accents and brackets of the addresses ("%C4%8D", "%28").
        $path = trim(rawurldecode($path), '/');
        $segments = $path === '' ? [] : explode('/', $path);

        $page = match (true) {
            $segments === [] => $this->home(),
            count($segments) === 1 && isset(self::STATIC_PAGES[$segments[0]]) => $this->staticPage($segments[0]),
            $segments === ['fizetes', 'eredmeny'] => new SeoPage('Fizetés eredménye', 'Az online fizetés eredménye.', '/fizetes/eredmeny', noIndex: true),
            $segments === ['ai-utazasi-tanacsado'] => $this->salesAssistant(),
            count($segments) === 2 && $segments[0] === 'ajanlat' => $this->offer($segments[1]),
            count($segments) === 2 && $segments[0] === 'blog' => $this->article($segments[1]),
            count($segments) === 2 && $segments[0] === 'kategoriak' => $this->category($segments[1]),
            count($segments) === 2 && $segments[0] === 'regiok' => $this->region($segments[1]),
            count($segments) === 2 && $segments[0] === 'apartman' => $this->apartment($segments[1]),
            count($segments) === 3 && $segments[0] === 'apartmanok' => $this->apartmentLocation($segments[1], $segments[2]),
            count($segments) === 1 => $this->page($segments[0]),
            default => SeoPage::notFound('/'.$path),
        };

        if ($page->status === 200) {
            return $page->withBody(($page->body ?? $this->bodies->text($page->title, $page->description))->withSections(...$this->siteSections()));
        }

        if ($page->status !== 404) {
            return $page;
        }

        // An old address no page lives at any more leads to where its content moved: the office's
        // redirect list first, then the closest listing of a retired trip, apartment or post.
        $target = $this->redirects->targetFor($path);

        return $target !== null ? SeoPage::movedTo($target) : ($this->retiredContent->for($segments) ?? $page);
    }

    private function page(string $slug): SeoPage
    {
        $page = Page::query()->published()->where('slug', $slug)->first();

        if ($page === null) {
            return SeoPage::notFound("/{$slug}");
        }

        $path = "/{$page->slug}";

        return new SeoPage(
            title: trim((string) $page->seo_title) ?: $page->title,
            description: trim((string) $page->seo_description) ?: $this->plain($page->content) ?: $page->title,
            canonicalPath: $path,
            image: $this->defaultImage(),
            jsonLd: [$this->breadcrumb([[$page->title, $path]])],
            robots: RobotsDirective::restrictive($page->seo_robots),
            body: $this->bodies->page($page),
        );
    }

    private function home(): SeoPage
    {
        $name = $this->siteName();
        $title = $this->setting('seo.default_title') ?: $name;
        $description = $this->setting('seo.default_description');
        $questions = $this->faq->items();

        return new SeoPage(
            title: $title,
            description: $description,
            body: $this->bodies->home($title, $description, $questions),
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
                    'image' => $this->defaultImage(),
                    'telephone' => $this->setting('contact.phone'),
                    'address' => $this->postalAddress($this->setting('contact.address')),
                    'geo' => ['@type' => 'GeoCoordinates', ...CompanyContact::OFFICE_COORDINATES],
                    'openingHoursSpecification' => OpeningHoursSpecification::fromText($this->setting('contact.opening_hours')),
                    'areaServed' => ['@type' => 'Country', 'name' => 'Magyarország'],
                    'foundingDate' => CompanyYears::FOUNDED_ON,
                    'sameAs' => array_values(array_filter([$this->setting('social.facebook'), $this->setting('social.instagram'), $this->setting('social.tiktok')])),
                ]),
                ['@context' => 'https://schema.org', '@type' => 'WebSite', 'name' => $name, 'url' => PublicSiteUrl::to('/')],
                ...($questions !== [] ? [$this->faqPage($questions)] : []),
            ],
        );
    }

    private function staticPage(string $slug): SeoPage
    {
        [$title, $description] = self::STATIC_PAGES[$slug];
        $body = match ($slug) {
            'utazasok' => $this->bodies->tours($title, $description),
            'blog' => $this->bodies->blog($title, $description),
            default => null,
        };

        return new SeoPage($title, $description, "/{$slug}", image: $this->defaultImage(), jsonLd: [$this->breadcrumb([[$title, "/{$slug}"]])], body: $body);
    }

    /**
     * The AI travel consultant demo: never indexed, and absent while it or its page is switched off.
     */
    private function salesAssistant(): SeoPage
    {
        $path = '/ai-utazasi-tanacsado';

        return config('sales_assistant.enabled') && config('sales_assistant.demo_page_enabled')
            ? new SeoPage('AI utazási tanácsadó (demó)', 'Beszélgess hangalapú AI utazási tanácsadónkkal, és találd meg a hozzád illő utat az Adria Holiday kínálatából.', $path, noIndex: true)
            : SeoPage::notFound($path);
    }

    private function offer(string $slug): SeoPage
    {
        $tour = Tour::query()->where('active', true)->where('seo_name', $slug)->first();

        if ($tour === null) {
            return SeoPage::notFound("/ajanlat/{$slug}");
        }

        $path = "/ajanlat/{$tour->seo_name}";
        $image = $tour->mainImage()?->getUrl();
        $description = trim((string) $tour->seo_description) ?: $this->plain($tour->short_description) ?: $this->plain($tour->list_description) ?: $tour->name;
        $dates = $tour->dates()->upcoming()->whereNotNull('start_date')->where('status', '!=', TourDateStatus::CANCELLED)->orderBy('start_date')->get();

        return new SeoPage(
            title: trim((string) $tour->seo_title) ?: $tour->name,
            description: $description,
            robots: RobotsDirective::restrictive($tour->seo_robots),
            canonicalPath: $path,
            image: $image ?: $this->defaultImage(),
            ogType: 'product',
            body: $this->bodies->offer($tour, $dates),
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
                    'offers' => $this->tripOffers($tour, $dates, PublicSiteUrl::to($path)),
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
            return SeoPage::notFound("/blog/{$slug}");
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
            body: $translation !== null ? $this->bodies->article($translation, $title) : null,
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
        $description = $this->plain($cardTranslation?->short_description) ?: "{$title}: válogass az Adria Holiday aktuális ajánlatai közül.";

        return new SeoPage(
            title: $title,
            description: $description,
            canonicalPath: $path,
            image: $card?->getFirstMedia('image')?->getUrl() ?: $this->defaultImage(),
            jsonLd: [$this->breadcrumb([['Utazások', '/utazasok'], [$title, $path]])],
            body: $this->bodies->category($category, $title, $description),
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
            body: $this->bodies->region($region),
        );
    }

    private function apartmentLocation(string $area, string $slug): SeoPage
    {
        $location = Location::query()->withApartmentPage()->where('area_slug', $area)->where('slug', $slug)->first();

        if ($location === null) {
            return SeoPage::notFound("/apartmanok/{$area}/{$slug}");
        }

        $path = $location->apartmentPagePath();
        $title = trim((string) $location->seo_title) ?: "{$location->name} apartmanok";

        return new SeoPage(
            title: $title,
            description: trim((string) $location->seo_description) ?: $this->plain($location->description) ?: "{$location->name}: apartmanok és szálláshelyek az Adria Holiday kínálatában.",
            robots: RobotsDirective::restrictive($location->seo_robots),
            canonicalPath: $path,
            image: $this->defaultImage(),
            jsonLd: [$this->breadcrumb([["{$location->name} apartmanok", $path]])],
            body: $this->bodies->apartmentLocation($location, $title),
        );
    }

    private function apartment(string $slug): SeoPage
    {
        $apartment = Apartment::query()->publiclyVisible()->where('slug', $slug)->with(['location', 'galleryItems.media'])->first();

        if ($apartment === null) {
            return SeoPage::notFound("/apartman/{$slug}");
        }

        $path = $apartment->pagePath();
        $image = $apartment->galleryItems->first(fn ($item): bool => $item->active && $item->media !== null)?->media->getUrl();
        $description = trim((string) $apartment->seo_description) ?: $this->plain($apartment->description) ?: $apartment->name;
        $location = $apartment->location;
        $trail = $location?->is_active && $location->area_slug ? [["{$location->name} apartmanok", $location->apartmentPagePath()]] : [];

        return new SeoPage(
            title: trim((string) $apartment->seo_title) ?: $apartment->name,
            description: $description,
            robots: RobotsDirective::restrictive($apartment->seo_robots),
            canonicalPath: $path,
            image: $image ?: $this->defaultImage(),
            body: $this->bodies->apartment($apartment),
            jsonLd: [
                $this->breadcrumb([...$trail, [$apartment->name, $path]]),
                array_filter([
                    '@context' => 'https://schema.org',
                    '@type' => 'Accommodation',
                    'name' => $apartment->name,
                    'description' => $description,
                    'image' => $image ? [$image] : null,
                    'url' => PublicSiteUrl::to($path),
                    'address' => $apartment->address !== '' ? $apartment->address : null,
                    'geo' => $apartment->latitude !== null ? ['@type' => 'GeoCoordinates', 'latitude' => (float) $apartment->latitude, 'longitude' => (float) $apartment->longitude] : null,
                ]),
            ],
        );
    }

    /**
     * The menu and the office's contact details that close every page's crawlable content.
     *
     * @return array<int, SeoLinkSection>
     */
    private function siteSections(): array
    {
        $phones = CompanyContact::phoneNumbers($this->setting('contact.phones'), $this->setting('contact.phone'));
        $email = $this->setting('contact.email');
        $openingHours = array_values(array_filter(array_map('trim', preg_split('/\R/u', $this->setting('contact.opening_hours')) ?: [])));

        return [
            new SeoLinkSection('Menü', array_map(fn (array $item): SeoLink => new SeoLink($item[0], $item[1]), self::MENU)),
            new SeoLinkSection("Kapcsolat – {$this->siteName()}", [
                new SeoLink($this->setting('contact.address'), '', 'iroda'),
                ...array_map(fn (string $phone): SeoLink => new SeoLink($phone, 'tel:'.preg_replace('/[^\d+]/', '', $phone)), $phones),
                ...($email !== '' ? [new SeoLink($email, "mailto:{$email}")] : []),
                ...array_map(fn (string $line): SeoLink => new SeoLink($line, '', 'nyitvatartás'), $openingHours),
            ]),
        ];
    }

    /**
     * A trip's offers: one per upcoming date with its own price, bookable until
     * departure, or the trip's starting price while no date is set.
     *
     * @param  Collection<int, TourDate>  $dates
     * @return array<int|string, mixed>|null
     */
    private function tripOffers(Tour $tour, Collection $dates, string $url): ?array
    {
        $offers = $dates
            ->filter(fn (TourDate $date): bool => (bool) ($date->price ?: $tour->price))
            ->map(fn (TourDate $date): array => [
                '@type' => 'Offer',
                'price' => (float) ($date->price ?: $tour->price),
                'priceCurrency' => 'HUF',
                'availability' => TourDateStatus::isBookable($date->status) ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
                'validThrough' => $date->start_date?->toDateString(),
                'url' => $url,
            ])
            ->values()
            ->all();

        if ($offers !== []) {
            return $offers;
        }

        return $tour->price ? [
            '@type' => 'Offer',
            'price' => (float) $tour->price,
            'priceCurrency' => 'HUF',
            'availability' => 'https://schema.org/InStock',
            'url' => $url,
        ] : null;
    }

    /**
     * @param  array<int, array{question: string, answer: string}>  $questions
     * @return array<string, mixed>
     */
    private function faqPage(array $questions): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => array_map(fn (array $item): array => [
                '@type' => 'Question',
                'name' => $item['question'],
                'acceptedAnswer' => ['@type' => 'Answer', 'text' => $item['answer']],
            ], $questions),
        ];
    }

    /**
     * The office address as a schema.org PostalAddress when it reads "3530 Miskolc, Városház tér 22.",
     * otherwise as the text itself.
     *
     * @return array<string, string>|string
     */
    private function postalAddress(string $address): array|string
    {
        if (preg_match('/^(\d{4})\s+([^,]+),\s*(.+)$/u', $address, $match) !== 1) {
            return $address;
        }

        return [
            '@type' => 'PostalAddress',
            'streetAddress' => trim($match[3]),
            'postalCode' => $match[1],
            'addressLocality' => trim($match[2]),
            'addressCountry' => 'HU',
        ];
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

        return CompanyYears::fill($this->settings[$key] ?? null) ?? match ($key) {
            'contact.email', 'contact.phone', 'contact.phones', 'contact.address', 'contact.opening_hours' => CompanyContact::DEFAULTS[Str::after($key, '.')]['value'],
            default => '',
        };
    }
}
