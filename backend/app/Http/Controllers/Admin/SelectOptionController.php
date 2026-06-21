<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\Gallery;
use App\Models\Location;
use App\Models\Region;
use Illuminate\Http\Request;

class SelectOptionController extends Controller
{
    public function regions(): array
    {
        return Region::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Region $region): array => [
                'id' => $region->id,
                'label' => $region->name,
            ])
            ->all();
    }

    public function locations(Request $request): array
    {
        $query = Location::query()->orderBy('sort_order')->orderBy('name');
        $query->where('is_active', true);

        if ($regionId = $request->query('region_id')) {
            $query->where('region_id', $regionId);
        }

        return $query->get(['id', 'name'])->map(fn (Location $location): array => [
            'id' => $location->id,
            'label' => $location->name,
        ])->all();
    }

    public function galleries(Request $request): array
    {
        $query = Gallery::query()->orderBy('sort_order')->orderBy('title');
        $query->where('is_active', true);

        if ($regionId = $request->query('region_id')) {
            $query->where('region_id', $regionId);
        }

        return $query->get(['id', 'title'])->map(fn (Gallery $gallery): array => [
            'id' => $gallery->id,
            'label' => $gallery->title,
        ])->all();
    }

    public function blogCategories(): array
    {
        return BlogCategory::query()
            ->where('active', true)
            ->with('translations')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (BlogCategory $category): array => [
                'id' => $category->id,
                'label' => $this->translationLabel($category->translations, $category->seo_name),
            ])
            ->all();
    }

    public function blogTags(): array
    {
        return BlogTag::query()
            ->where('active', true)
            ->with('translations')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (BlogTag $tag): array => [
                'id' => $tag->id,
                'label' => $this->translationLabel($tag->translations, (string) $tag->id),
            ])
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
