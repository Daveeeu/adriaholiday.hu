<?php

namespace App\Services\Seo;

use App\Models\Apartment;
use App\Models\BlogArticle;
use App\Models\BlogArticleTranslation;
use App\Models\BlogCategory;
use App\Models\HomepageOffer;
use App\Models\Location;
use App\Models\Page;
use App\Models\Region;
use App\Models\Tour;
use App\Models\TourDate;
use App\Support\PlainText;
use App\Support\PortfolioCategoryLinks;
use App\Support\PortfolioOfferQuery;
use App\Support\Seo\SeoBody;
use App\Support\Seo\SeoLink;
use App\Support\Seo\SeoLinkSection;
use App\Support\Tour\TourDateStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * The crawlable content of each public page (see SeoBody): the page's own
 * text, and the trips, apartments or posts it lists as links, as the app
 * shows them.
 */
class PortfolioSeoBodies
{
    /** Upper bound of the links a listing page carries; the app pages the rest. */
    private const LIST_LIMIT = 100;

    private const FEATURED_LIMIT = 12;

    private const UPCOMING_DATES_LIMIT = 6;

    /** Long trip programs are cut to keep the page light; the first days tell what the trip is. */
    private const PROGRAM_PARAGRAPHS_LIMIT = 30;

    public function text(string $heading, string $description): SeoBody
    {
        return new SeoBody($heading, array_values(array_filter([$description])));
    }

    /**
     * @param  array<int, array{question: string, answer: string}>  $questions  the page's frequently asked questions
     */
    public function home(string $heading, string $description, array $questions): SeoBody
    {
        $categorySlugs = PortfolioCategoryLinks::existingSlugs();

        $categories = HomepageOffer::query()
            ->where('active', true)
            ->where('link', 'like', '/kategoriak/%')
            ->with('translations')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->filter(fn (HomepageOffer $offer): bool => PortfolioCategoryLinks::leadsToPage($offer->link, $categorySlugs))
            ->map(function (HomepageOffer $offer): ?SeoLink {
                $translation = $offer->translations->firstWhere('locale', 'hu');
                $name = trim((string) $translation?->name);

                return $name !== '' ? new SeoLink($name, (string) $offer->link, PlainText::line($translation?->short_description)) : null;
            })
            ->filter()
            ->values()
            ->all();

        $featured = $this->tourLinks(
            PortfolioOfferQuery::applyFeaturedOrdering($this->listedTours()->where('featured', true))->limit(self::FEATURED_LIMIT),
        );

        return new SeoBody($heading, array_values(array_filter([$description])), [
            new SeoLinkSection('Utazási kategóriák', $categories),
            new SeoLinkSection('Kiemelt ajánlataink', $featured),
            new SeoLinkSection('Apartmanok a tengerparton', $this->locationLinks()),
        ], $questions);
    }

    public function tours(string $heading, string $description): SeoBody
    {
        return new SeoBody($heading, array_values(array_filter([$description])), [
            new SeoLinkSection('Aktuális utazásaink', $this->tourLinks(PortfolioOfferQuery::applyDefaultOrdering($this->listedTours()))),
        ]);
    }

    public function blog(string $heading, string $description): SeoBody
    {
        $articles = BlogArticle::query()
            ->where('active', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now())
            ->with('translations')
            ->orderByDesc('published_at')
            ->limit(self::LIST_LIMIT)
            ->get()
            ->map(function (BlogArticle $article): ?SeoLink {
                $translation = $article->translations->firstWhere('locale', 'hu') ?? $article->translations->first();

                return $translation?->seo_name
                    ? new SeoLink((string) ($translation->title ?: $article->image_title), "/blog/{$translation->seo_name}", PlainText::line($translation->excerpt))
                    : null;
            })
            ->filter()
            ->values()
            ->all();

        return new SeoBody($heading, array_values(array_filter([$description])), [new SeoLinkSection('Legfrissebb bejegyzések', $articles)]);
    }

    public function category(BlogCategory $category, string $heading, string $description): SeoBody
    {
        $tours = PortfolioOfferQuery::applyDefaultOrdering(PortfolioOfferQuery::applyCategoryFilter($this->listedTours(), $category));

        return new SeoBody($heading, array_values(array_filter([$description])), [
            new SeoLinkSection("{$heading}: aktuális ajánlataink", $this->tourLinks($tours)),
        ]);
    }

    public function region(Region $region): SeoBody
    {
        $paragraphs = PlainText::paragraphs($region->description) ?: array_values(array_filter([PlainText::line($region->summary)]));
        $tours = PortfolioOfferQuery::applyDefaultOrdering($this->listedTours()->where('region_id', $region->id));

        return new SeoBody($region->name, $paragraphs, [
            new SeoLinkSection("{$region->name}: utazásaink", $this->tourLinks($tours)),
        ]);
    }

    /**
     * @param  Collection<int, TourDate>  $dates  the trip's upcoming dates that take or took bookings, earliest first
     */
    public function offer(Tour $tour, Collection $dates): SeoBody
    {
        $paragraphs = array_values(array_filter([
            PlainText::line($tour->subtitle),
            PlainText::line($tour->short_description),
            ...PlainText::paragraphs($tour->list_description),
            $tour->price ? 'Induló ár: '.$this->price($tour->price).'/fő' : null,
            ...array_slice(PlainText::paragraphs($tour->program), 0, self::PROGRAM_PARAGRAPHS_LIMIT),
        ]));

        $dateLinks = $dates->take(self::UPCOMING_DATES_LIMIT)
            ->map(fn (TourDate $date): SeoLink => new SeoLink($this->dateRange($date), '', $date->price ? $this->price($date->price).'/fő' : null))
            ->values()
            ->all();

        $categoryIds = array_map('intval', $tour->category_ids ?? []);
        $categories = BlogCategory::query()->where('active', true)->whereIn('id', $categoryIds)->with('translations')->get()
            ->map(fn (BlogCategory $category): ?SeoLink => $category->seo_name
                ? new SeoLink((string) ($category->translations->firstWhere('locale', 'hu')?->name ?: Str::headline($category->seo_name)), "/kategoriak/{$category->seo_name}")
                : null)
            ->filter()
            ->values()
            ->all();

        return new SeoBody($tour->name, $paragraphs, [
            new SeoLinkSection('Időpontok', $dateLinks),
            new SeoLinkSection('Kapcsolódó kategóriák', $categories),
        ]);
    }

    public function article(BlogArticleTranslation $translation, string $heading): SeoBody
    {
        return new SeoBody($heading, PlainText::paragraphs($translation->content));
    }

    public function page(Page $page): SeoBody
    {
        return new SeoBody($page->title, PlainText::paragraphs($page->content));
    }

    public function apartmentLocation(Location $location, string $heading): SeoBody
    {
        $apartments = $location->apartments()->publiclyVisible()->orderBy('name')->limit(self::LIST_LIMIT)->get()
            ->map(fn (Apartment $apartment): SeoLink => new SeoLink($apartment->name, $apartment->pagePath(), $apartment->address ?: null))
            ->all();

        return new SeoBody($heading, PlainText::paragraphs($location->description), [
            new SeoLinkSection("{$location->name}: apartmanjaink", $apartments),
        ]);
    }

    public function apartment(Apartment $apartment): SeoBody
    {
        $paragraphs = array_values(array_filter([
            $apartment->address ?: null,
            ...PlainText::paragraphs($apartment->description),
        ]));
        $location = $apartment->location;
        $more = $location?->is_active && $location->area_slug
            ? [new SeoLink("{$location->name}: további apartmanjaink", $location->apartmentPagePath())]
            : [];

        return new SeoBody($apartment->name, $paragraphs, [new SeoLinkSection('További apartmanok', $more)]);
    }

    /**
     * @return Builder<Tour>
     */
    private function listedTours(): Builder
    {
        return Tour::query()
            ->listedPublicly()
            ->with(['dates' => fn ($query) => $query->upcoming()->whereNotNull('start_date')->where('status', '!=', TourDateStatus::CANCELLED)->orderBy('start_date')]);
    }

    /**
     * @param  Builder<Tour>  $tours
     * @return array<int, SeoLink>
     */
    private function tourLinks(Builder $tours): array
    {
        return $tours->limit(self::LIST_LIMIT)->get()
            ->map(fn (Tour $tour): SeoLink => new SeoLink($tour->name, "/ajanlat/{$tour->seo_name}", $this->tourDetail($tour)))
            ->all();
    }

    private function tourDetail(Tour $tour): ?string
    {
        /** @var TourDate|null $next the earliest upcoming date (see listedTours()) */
        $next = $tour->dates->first();

        $parts = array_filter([
            PlainText::line($tour->short_description),
            $next ? $this->dateRange($next) : null,
            $tour->price ? 'induló ár '.$this->price($tour->price) : null,
        ]);

        return $parts !== [] ? implode(' · ', $parts) : null;
    }

    /**
     * @return array<int, SeoLink>
     */
    private function locationLinks(): array
    {
        return Location::query()->withApartmentPage()->orderBy('name')->get()
            ->map(fn (Location $location): SeoLink => new SeoLink("{$location->name} apartmanok", $location->apartmentPagePath()))
            ->all();
    }

    private function dateRange(TourDate $date): string
    {
        $start = $date->start_date?->format('Y.m.d.');
        $end = $date->end_date?->format('Y.m.d.');

        return $end !== null && $end !== $start ? "{$start} – {$end}" : (string) $start;
    }

    private function price(mixed $amount): string
    {
        return number_format((float) $amount, 0, ',', ' ').' Ft';
    }
}
