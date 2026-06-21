<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\HomepageOffer\StoreHomepageOfferRequest;
use App\Http\Requests\Admin\HomepageOffer\UpdateHomepageOfferRequest;
use App\Http\Resources\HomepageOfferResource;
use App\Models\HomepageOffer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class HomepageOfferController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(HomepageOffer::class, 'homepage_offer');
        $this->middleware('permission:homepage-offers.viewAny')->only('index');
        $this->middleware('permission:homepage-offers.view')->only('show');
        $this->middleware('permission:homepage-offers.create')->only('store');
        $this->middleware('permission:homepage-offers.update')->only('update');
        $this->middleware('permission:homepage-offers.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = HomepageOffer::query()->with(['translations', 'media']);

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('image_title', 'like', "%{$search}%")
                    ->orWhere('link', 'like', "%{$search}%")
                    ->orWhereHas('translations', function ($translationQuery) use ($search): void {
                        $translationQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('seo_name', 'like', "%{$search}%");
                    });
            });
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'sort_order')));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'asc'));
        $allowedSorts = ['id', 'name', 'active', 'sort_order', 'link', 'image_title', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'sort_order';
        }

        $direction = $sortDirection === 'desc' ? 'desc' : 'asc';
        if ($sortBy === 'name') {
            $query->orderByRaw(
                "(select name from homepage_offer_translations where homepage_offer_translations.homepage_offer_id = homepage_offers.id and locale = 'hu' limit 1) {$direction}"
            );
        } else {
            $query->orderBy($sortBy, $direction);
        }

        $paginator = $query->paginate($perPage);

        return $this->paginated(HomepageOfferResource::class, $paginator);
    }

    public function store(StoreHomepageOfferRequest $request)
    {
        $validated = $request->validated();

        $offer = DB::transaction(function () use ($validated): HomepageOffer {
            $offer = HomepageOffer::create([
                'active' => $validated['active'] ?? true,
                'sort_order' => $validated['sort_order'] ?? 0,
                'image' => $validated['image'] ?? null,
                'image_title' => $validated['image_title'],
                'link' => $validated['link'],
            ]);

            $this->syncTranslations($offer, $validated['translations']);

            return $offer;
        });

        return new HomepageOfferResource($offer->load(['translations', 'media']));
    }

    public function show(HomepageOffer $homepageOffer)
    {
        return new HomepageOfferResource($homepageOffer->load(['translations', 'media']));
    }

    public function update(UpdateHomepageOfferRequest $request, HomepageOffer $homepageOffer)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($homepageOffer, $validated): void {
            $homepageOffer->update([
                'active' => $validated['active'] ?? true,
                'sort_order' => $validated['sort_order'] ?? 0,
                'image' => $validated['image'] ?? null,
                'image_title' => $validated['image_title'],
                'link' => $validated['link'],
            ]);

            $this->syncTranslations($homepageOffer, $validated['translations']);
        });

        return new HomepageOfferResource($homepageOffer->refresh()->load(['translations', 'media']));
    }

    public function destroy(HomepageOffer $homepageOffer)
    {
        $homepageOffer->delete();

        return response()->noContent();
    }

    /**
     * @param array<string, array<string, mixed>> $translations
     */
    private function syncTranslations(HomepageOffer $offer, array $translations): void
    {
        foreach ($translations as $locale => $translation) {
            $offer->translations()->updateOrCreate(
                ['locale' => $locale],
                [
                    'name' => $translation['name'],
                    'seo_name' => $translation['seo_name'],
                    'short_description' => $translation['short_description'] ?? null,
                ],
            );
        }
    }
}
