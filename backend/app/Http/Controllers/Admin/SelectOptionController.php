<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Gallery;
use App\Models\HomepageOffer;
use App\Models\Location;
use App\Models\Region;
use App\Models\TourDeparturePlace;
use App\Models\TourRegionGroup;
use App\Models\TourReferenceOption;
use App\Models\TourSeasonalGroup;
use Illuminate\Http\Request;

class SelectOptionController extends Controller
{
    /**
     * @return array{id: int|string, value: int|string, label: string}
     */
    private function option(int|string $id, string $label): array
    {
        return [
            'id' => $id,
            'value' => $id,
            'label' => trim($label),
        ];
    }

    public function regions(Request $request): array
    {
        return Region::query()
            ->where('is_active', true)
            ->when($search = trim((string) $request->query('search', '')), function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Region $region): array => $this->option($region->id, $region->name))
            ->all();
    }

    public function groups(Request $request): array
    {
        return TourRegionGroup::query()
            ->where('active', true)
            ->where('type', 'group')
            ->when($search = trim((string) $request->query('search', '')), function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('name', 'like', "%{$search}%")
                        ->orWhere('seo_name', 'like', "%{$search}%");
                });
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['seo_name', 'name'])
            ->map(fn (TourRegionGroup $group): array => $this->option($group->seo_name, $group->name))
            ->all();
    }

    public function offerGroups(Request $request): array
    {
        return TourSeasonalGroup::query()
            ->where('active', true)
            ->when($search = trim((string) $request->query('search', '')), function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('name', 'like', "%{$search}%")
                        ->orWhere('seo_name', 'like', "%{$search}%");
                });
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['seo_name', 'name'])
            ->map(fn (TourSeasonalGroup $group): array => $this->option($group->seo_name, $group->name))
            ->all();
    }

    public function homepageOffers(Request $request): array
    {
        return HomepageOffer::query()
            ->where('active', true)
            ->with('translations')
            ->when($search = trim((string) $request->query('search', '')), function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('image_title', 'like', "%{$search}%")
                        ->orWhere('link', 'like', "%{$search}%")
                        ->orWhereHas('translations', function ($translationQuery) use ($search): void {
                            $translationQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('seo_name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('sort_order')
            ->orderBy('image_title')
            ->get()
            ->map(fn (HomepageOffer $offer): array => $this->option(
                $offer->id,
                $this->translationLabel($offer->translations, $offer->image_title),
            ))
            ->all();
    }

    public function departurePlaces(Request $request): array
    {
        return TourDeparturePlace::query()
            ->where('active', true)
            ->when($search = trim((string) $request->query('search', '')), function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('name', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (TourDeparturePlace $place): array => $this->option($place->id, $place->name))
            ->all();
    }

    public function locations(Request $request): array
    {
        $query = Location::query()->orderBy('sort_order')->orderBy('name');
        $query->where('is_active', true);

        if ($regionId = $request->query('region_id')) {
            $query->where('region_id', $regionId);
        }

        return $query->get(['id', 'name'])->map(fn (Location $location): array => $this->option($location->id, $location->name))->all();
    }

    public function galleries(Request $request): array
    {
        $query = Gallery::query()->orderBy('sort_order')->orderBy('title');
        $query->where('is_active', true);

        if ($regionId = $request->query('region_id')) {
            $query->where('region_id', $regionId);
        }

        return $query->get(['id', 'title'])->map(fn (Gallery $gallery): array => $this->option($gallery->id, $gallery->title))->all();
    }

    public function blogCategories(Request $request): array
    {
        return BlogCategory::query()
            ->where('active', true)
            ->with('translations')
            ->when($search = trim((string) $request->query('search', '')), function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('seo_name', 'like', "%{$search}%")
                        ->orWhereHas('translations', function ($translationQuery) use ($search): void {
                            $translationQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('seo_name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderBy('sort_order')
            ->get()
            ->map(fn (BlogCategory $category): array => $this->option(
                $category->id,
                $this->translationLabel($category->translations, $category->seo_name),
            ))
            ->all();
    }

    public function blogTags(Request $request): array
    {
        return BlogTag::query()
            ->where('active', true)
            ->with('translations')
            ->when($search = trim((string) $request->query('search', '')), function ($query) use ($search): void {
                $query->whereHas('translations', function ($translationQuery) use ($search): void {
                    $translationQuery->where('name', 'like', "%{$search}%");
                });
            })
            ->orderBy('sort_order')
            ->get()
            ->map(fn (BlogTag $tag): array => $this->option(
                $tag->id,
                $this->translationLabel($tag->translations, (string) $tag->id),
            ))
            ->all();
    }

    public function countries(Request $request): array
    {
        return TourReferenceOption::query()
            ->where('type', 'country')
            ->where('active', true)
            ->when($search = trim((string) $request->query('search', '')), function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['code', 'name'])
            ->map(fn (TourReferenceOption $option): array => $this->option($option->code, $option->name))
            ->all();
    }

    public function fits(Request $request): array
    {
        return $this->referenceOptions($request, 'fit');
    }

    public function programTypes(Request $request): array
    {
        return $this->referenceOptions($request, 'program-type');
    }

    public function travelModes(Request $request): array
    {
        return $this->referenceOptions($request, 'travel-mode');
    }

    public function difficulties(Request $request): array
    {
        return $this->referenceOptions($request, 'difficulty');
    }

    /**
     * @return array<int, array{id: string, value: string, label: string}>
     */
    private function referenceOptions(Request $request, string $type): array
    {
        return TourReferenceOption::query()
            ->where('type', $type)
            ->where('active', true)
            ->when($search = trim((string) $request->query('search', '')), function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['code', 'name'])
            ->map(fn (TourReferenceOption $option): array => $this->option($option->code, $option->name))
            ->all();
    }

    private function translationLabel($translations, string $fallback): string
    {
        $translation = $translations->firstWhere('locale', 'hu')
            ?? $translations->first();

        $label = $translation?->name ?? null;

        return $label ?: $fallback;
    }
}
