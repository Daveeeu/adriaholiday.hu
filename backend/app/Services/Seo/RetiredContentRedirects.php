<?php

namespace App\Services\Seo;

use App\Models\Apartment;
use App\Models\BlogArticle;
use App\Models\BlogCategory;
use App\Models\Location;
use App\Models\Tour;
use App\Support\Seo\SeoPage;

/**
 * Where the address of a trip, apartment or blog post leads once its page is
 * gone, so old links and search results (most of them the legacy site's) land
 * on the closest live listing instead of a 404.
 * Content that is only switched off may come back at the same address, so it
 * moves temporarily (302); deleted content and legacy-only addresses move
 * permanently (301).
 */
class RetiredContentRedirects
{
    private const TOURS_PATH = '/utazasok';

    private const BLOG_PATH = '/blog';

    /**
     * The redirect of a path no page lives at, or null when it stays a 404.
     *
     * @param  array<int, string>  $segments  the decoded path segments
     */
    public function for(array $segments): ?SeoPage
    {
        return match (true) {
            count($segments) === 2 && $segments[0] === 'ajanlat' => $this->tour($segments[1]),
            count($segments) === 2 && $segments[0] === 'apartman' => $this->apartment($segments[1]),
            count($segments) === 2 && $segments[0] === 'blog' => $this->article($segments[1]),
            // The legacy blog's tag and category listings ("blog/cimke/utazas-2").
            count($segments) === 3 && $segments[0] === 'blog' && in_array($segments[1], ['cimke', 'kategoria'], true) => SeoPage::movedTo(self::BLOG_PATH),
            default => null,
        };
    }

    /**
     * A trip that is off or deleted leads to the first of its categories that
     * has a page, otherwise to all trips.
     */
    private function tour(string $slug): ?SeoPage
    {
        $tour = Tour::withTrashed()->where('seo_name', $slug)->orderBy('deleted_at')->first(['id', 'category_ids', 'deleted_at']);

        if ($tour === null) {
            return null;
        }

        $categoryIds = array_map('intval', $tour->category_ids ?? []);
        $categories = BlogCategory::query()->where('active', true)->whereIn('id', $categoryIds)->pluck('seo_name', 'id');
        $categoryId = collect($categoryIds)->first(fn (int $id): bool => $categories->has($id));
        $target = $categoryId !== null ? "/kategoriak/{$categories[$categoryId]}" : self::TOURS_PATH;

        return $this->moved($target, $tour->trashed());
    }

    /**
     * An apartment that is off or deleted leads to the apartments of its
     * location, otherwise to the home page.
     */
    private function apartment(string $slug): ?SeoPage
    {
        $apartment = Apartment::withTrashed()->where('slug', $slug)->orderBy('deleted_at')->first(['id', 'location_id', 'deleted_at']);

        if ($apartment === null) {
            return null;
        }

        $location = Location::query()->withApartmentPage()->whereKey($apartment->location_id)->first(['id', 'area_slug', 'slug']);

        return $this->moved($location?->apartmentPagePath() ?? '/', $apartment->trashed());
    }

    /**
     * Legacy post URLs carried the post id after the URL name ("…-27"): the post
     * moves to the URL without it, or to the blog when it was not kept. A post
     * that is off or deleted leads to the blog.
     */
    private function article(string $slug): ?SeoPage
    {
        $article = BlogArticle::withTrashed()
            ->whereHas('translations', fn ($query) => $query->where('seo_name', $slug))
            ->orderBy('deleted_at')
            ->first(['id', 'deleted_at']);

        if ($article !== null) {
            return $this->moved(self::BLOG_PATH, $article->trashed());
        }

        if (! preg_match('/^(.+)-\d+$/', $slug, $match)) {
            return null;
        }

        $live = BlogArticle::query()
            ->where('active', true)
            ->whereHas('translations', fn ($query) => $query->where('seo_name', $match[1]))
            ->exists();

        return SeoPage::movedTo($live ? "/blog/{$match[1]}" : self::BLOG_PATH);
    }

    private function moved(string $target, bool $permanently): SeoPage
    {
        return $permanently ? SeoPage::movedTo($target) : SeoPage::temporarilyMovedTo($target);
    }
}
