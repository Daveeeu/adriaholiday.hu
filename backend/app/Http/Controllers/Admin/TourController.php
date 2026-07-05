<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Tour\MoveTourRequest;
use App\Http\Requests\Admin\Tour\ReorderToursRequest;
use App\Http\Requests\Admin\Tour\StoreTourRequest;
use App\Http\Requests\Admin\Tour\UpdateTourRequest;
use App\Http\Requests\Admin\Tour\UpdateTourStatusRequest;
use App\Http\Resources\TourDetailResource;
use App\Http\Resources\TourResource;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourPriceItem;
use App\Models\TourProgramDay;
use App\Support\PublicContentCache;
use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TourController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(Tour::class, 'tour');
        $this->middleware('permission:tours.viewAny')->only('index');
        $this->middleware('permission:tours.view')->only('show');
        $this->middleware('permission:tours.create')->only('store');
        $this->middleware('permission:tours.update')->only('update');
        $this->middleware('permission:tours.delete')->only('destroy');
        $this->middleware('permission:tours.status')->only('status');
        $this->middleware('permission:tours.reorder')->only(['reorder', 'move']);
        $this->middleware('permission:tours.duplicate')->only('duplicate');
    }

    public function index(Request $request)
    {
        $query = Tour::query()->with(['region', 'homepageOffer.translations', 'departurePlaces', 'media', 'priceItems', 'programDays', 'galleryItems.media']);

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('seo_name', 'like', "%{$search}%")
                    ->orWhere('action1', 'like', "%{$search}%")
                    ->orWhere('action2', 'like', "%{$search}%")
                    ->orWhere('list_description', 'like', "%{$search}%")
                    ->orWhere('short_description', 'like', "%{$search}%")
                    ->orWhere('group_id', 'like', "%{$search}%")
                    ->orWhere('seasonal_group_id', 'like', "%{$search}%")
                    ->orWhere('fit_id', 'like', "%{$search}%")
                    ->orWhere('program_type_id', 'like', "%{$search}%")
                    ->orWhere('travel_mode_id', 'like', "%{$search}%")
                    ->orWhere('difficulty_id', 'like', "%{$search}%");
            });
        }

        foreach (['region_id' => 'regionId', 'group_id' => 'groupId', 'seasonal_group_id' => 'seasonalGroupId'] as $field => $camelField) {
            if (($value = $request->query($field, $request->query($camelField))) !== null && $value !== '') {
                $query->where($field, $value);
            }
        }

        foreach (['featured' => 'featured', 'active' => 'active', 'image_offer' => 'imageOffer', 'xml_enabled' => 'xmlEnabled'] as $field => $camelField) {
            $value = $request->query($field, $request->query($camelField));
            if ($value !== null && $value !== '' && $value !== 'all') {
                $query->where($field, filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false);
            }
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'sort_order')));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'asc'));
        $allowedSorts = ['id', 'sort_order', 'name', 'region_id', 'group_id', 'seasonal_group_id', 'price', 'displayed_price', 'active', 'featured', 'image_offer', 'xml_enabled', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'sort_order';
        }

        $paginator = $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc')
            ->paginate($perPage);

        return $this->paginated(TourResource::class, $paginator);
    }

    public function store(StoreTourRequest $request)
    {
        $validated = $request->validated();
        $priceBox = $this->tourPriceBoxAttributes($validated);

        $tour = DB::transaction(function () use ($validated, $priceBox): Tour {
            $tour = Tour::create(array_merge([
                'sort_order' => $validated['sort_order'] ?? 0,
                'active' => $validated['active'] ?? true,
                'featured' => $validated['featured'] ?? false,
                'recommended' => $validated['recommended'] ?? false,
                'partner_offer' => $validated['partner_offer'] ?? false,
                'image_offer' => $validated['image_offer'] ?? false,
                'xml_enabled' => $validated['xml_enabled'] ?? false,
                'slider_image_enabled' => $validated['slider_image_enabled'] ?? false,
                'slider_text_enabled' => $validated['slider_text_enabled'] ?? false,
                'name' => $validated['name'],
                'seo_name' => $validated['seo_name'] ?? null,
                'seo_auto_generate' => $validated['seo_auto_generate'] ?? false,
                'action1' => $validated['action1'] ?? null,
                'action2' => $validated['action2'] ?? null,
                'list_description' => RichTextSanitizer::sanitize($validated['list_description'] ?? null),
                'short_description' => RichTextSanitizer::sanitize($validated['short_description'] ?? null),
                'program_pdf_path' => $validated['program_pdf_path'] ?? null,
                'program_pdf_file' => $validated['program_pdf_file'] ?? null,
                'slider_image' => $validated['slider_image'] ?? null,
                'program_before' => RichTextSanitizer::sanitize($validated['program_before'] ?? null),
                'program' => RichTextSanitizer::sanitize($validated['program'] ?? null),
                'inclusions' => RichTextSanitizer::sanitize($validated['inclusions'] ?? null),
                'payment_program' => RichTextSanitizer::sanitize($validated['payment_program'] ?? null),
                'prices' => RichTextSanitizer::sanitize($validated['prices'] ?? null),
                'discounts' => RichTextSanitizer::sanitize($validated['discounts'] ?? null),
                'notes' => RichTextSanitizer::sanitize($validated['notes'] ?? null),
                'gallery_title' => $validated['gallery_title'] ?? null,
                'gallery_subtitle' => $validated['gallery_subtitle'] ?? null,
                'region_id' => $validated['region_id'] ?? null,
                'homepage_offer_id' => $validated['homepage_offer_id'] ?? null,
                'group_id' => $validated['group_id'] ?? null,
                'seasonal_group_id' => $validated['seasonal_group_id'] ?? null,
                'fit_id' => $validated['fit_id'] ?? null,
                'program_type_id' => $validated['program_type_id'] ?? null,
                'travel_mode_id' => $validated['travel_mode_id'] ?? null,
                'difficulty_id' => $validated['difficulty_id'] ?? null,
                'country_ids' => $validated['country_ids'] ?? [],
                'tag_ids' => $validated['tag_ids'] ?? [],
                'category_ids' => $validated['category_ids'] ?? [],
                'price' => $priceBox['price'],
                'displayed_price' => $priceBox['displayed_price'],
                'slider_text' => $validated['slider_text'] ?? null,
            ], $priceBox));

            $this->syncTourDates($tour, $validated['dates'] ?? []);
            $this->syncPartnerBonuses($tour, $validated['partner_bonuses'] ?? []);
            $this->syncProgramDays($tour, $validated['program_days'] ?? []);
            $this->syncGalleryItems($tour, $validated['gallery'] ?? []);
            $this->syncPriceItems($tour, $validated['price_items'] ?? []);
            $tour->departurePlaces()->sync($validated['departure_place_ids'] ?? []);

            return $tour;
        });

        PublicContentCache::bump(PublicContentCache::OFFERS, PublicContentCache::PORTFOLIO_FILTERS, PublicContentCache::SITEMAP);

        return new TourDetailResource($tour->load(['region', 'homepageOffer.translations', 'dates', 'partnerBonuses', 'departurePlaces', 'media', 'priceItems', 'programDays', 'galleryItems.media']));
    }

    public function show(Tour $tour)
    {
        return new TourDetailResource($tour->load(['region', 'homepageOffer.translations', 'dates', 'partnerBonuses', 'departurePlaces', 'media', 'priceItems', 'programDays', 'galleryItems.media']));
    }

    public function update(UpdateTourRequest $request, Tour $tour)
    {
        $validated = $request->validated();
        $priceBox = $this->tourPriceBoxAttributes($validated);

        DB::transaction(function () use ($tour, $validated, $priceBox): void {
            $tour->update(array_merge([
                'sort_order' => $validated['sort_order'] ?? 0,
                'active' => $validated['active'] ?? true,
                'featured' => $validated['featured'] ?? false,
                'recommended' => $validated['recommended'] ?? false,
                'partner_offer' => $validated['partner_offer'] ?? false,
                'image_offer' => $validated['image_offer'] ?? false,
                'xml_enabled' => $validated['xml_enabled'] ?? false,
                'slider_image_enabled' => $validated['slider_image_enabled'] ?? false,
                'slider_text_enabled' => $validated['slider_text_enabled'] ?? false,
                'name' => $validated['name'],
                'seo_name' => $validated['seo_name'] ?? null,
                'seo_auto_generate' => $validated['seo_auto_generate'] ?? false,
                'action1' => $validated['action1'] ?? null,
                'action2' => $validated['action2'] ?? null,
                'list_description' => RichTextSanitizer::sanitize($validated['list_description'] ?? null),
                'short_description' => RichTextSanitizer::sanitize($validated['short_description'] ?? null),
                'program_pdf_path' => $validated['program_pdf_path'] ?? null,
                'program_pdf_file' => $validated['program_pdf_file'] ?? null,
                'slider_image' => $validated['slider_image'] ?? null,
                'program_before' => RichTextSanitizer::sanitize($validated['program_before'] ?? null),
                'program' => RichTextSanitizer::sanitize($validated['program'] ?? null),
                'inclusions' => RichTextSanitizer::sanitize($validated['inclusions'] ?? null),
                'payment_program' => RichTextSanitizer::sanitize($validated['payment_program'] ?? null),
                'prices' => RichTextSanitizer::sanitize($validated['prices'] ?? null),
                'discounts' => RichTextSanitizer::sanitize($validated['discounts'] ?? null),
                'notes' => RichTextSanitizer::sanitize($validated['notes'] ?? null),
                'gallery_title' => $validated['gallery_title'] ?? null,
                'gallery_subtitle' => $validated['gallery_subtitle'] ?? null,
                'region_id' => $validated['region_id'] ?? null,
                'homepage_offer_id' => $validated['homepage_offer_id'] ?? null,
                'group_id' => $validated['group_id'] ?? null,
                'seasonal_group_id' => $validated['seasonal_group_id'] ?? null,
                'fit_id' => $validated['fit_id'] ?? null,
                'program_type_id' => $validated['program_type_id'] ?? null,
                'travel_mode_id' => $validated['travel_mode_id'] ?? null,
                'difficulty_id' => $validated['difficulty_id'] ?? null,
                'country_ids' => $validated['country_ids'] ?? [],
                'tag_ids' => $validated['tag_ids'] ?? [],
                'category_ids' => $validated['category_ids'] ?? [],
                'price' => $priceBox['price'],
                'displayed_price' => $priceBox['displayed_price'],
                'slider_text' => $validated['slider_text'] ?? null,
            ], $priceBox));

            $this->syncTourDates($tour, $validated['dates'] ?? []);
            $this->syncPartnerBonuses($tour, $validated['partner_bonuses'] ?? []);
            $this->syncProgramDays($tour, $validated['program_days'] ?? []);
            $this->syncGalleryItems($tour, $validated['gallery'] ?? []);
            $this->syncPriceItems($tour, $validated['price_items'] ?? []);
            $tour->departurePlaces()->sync($validated['departure_place_ids'] ?? []);
        });

        PublicContentCache::bump(PublicContentCache::OFFERS, PublicContentCache::PORTFOLIO_FILTERS, PublicContentCache::SITEMAP);

        return new TourDetailResource($tour->refresh()->load(['region', 'homepageOffer.translations', 'dates', 'partnerBonuses', 'departurePlaces', 'media', 'priceItems', 'programDays', 'galleryItems.media']));
    }

    public function destroy(Tour $tour)
    {
        $tour->delete();

        PublicContentCache::bump(PublicContentCache::OFFERS, PublicContentCache::PORTFOLIO_FILTERS, PublicContentCache::SITEMAP);

        return response()->noContent();
    }

    public function status(UpdateTourStatusRequest $request, Tour $tour)
    {
        $this->authorize('status', $tour);

        $tour->update(['active' => $request->validated()['active']]);

        PublicContentCache::bump(PublicContentCache::OFFERS, PublicContentCache::PORTFOLIO_FILTERS, PublicContentCache::SITEMAP);

        return new TourResource($tour->refresh()->load(['homepageOffer.translations', 'departurePlaces', 'media', 'priceItems', 'programDays', 'galleryItems.media']));
    }

    public function duplicate(Tour $tour)
    {
        $this->authorize('duplicate', $tour);

        $duplicate = DB::transaction(function () use ($tour): Tour {
            $copy = $tour->replicate();
            $copy->name = $tour->name.' Copy';
            $copy->seo_name = $tour->seo_name ? Str::slug($tour->seo_name.' copy') : Str::slug($tour->name.' copy');
            $copy->sort_order = $tour->sort_order + 1;
            $copy->push();

            $tour->load(['dates', 'partnerBonuses', 'departurePlaces', 'priceItems', 'programDays', 'galleryItems.media']);
            $this->syncTourDates($copy, $tour->dates->map(fn (TourDate $date): array => [
                'start_date' => $date->start_date?->toDateString(),
                'end_date' => $date->end_date?->toDateString(),
                'price' => $date->price,
                'price_box_price' => $date->price_box_price,
                'price_box_displayed_price' => $date->price_box_displayed_price,
                'price_box_discount_badge' => $date->price_box_discount_badge,
                'price_box_min_participants' => $date->price_box_min_participants,
                'price_box_max_participants' => $date->price_box_max_participants,
                'price_box_available_seats' => $date->price_box_available_seats,
                'price_box_capacity' => $date->price_box_capacity,
                'status' => $date->status,
            ])->all());
            $this->syncPartnerBonuses($copy, $tour->partnerBonuses->map(fn ($bonus): array => [
                'sort_order' => $bonus->sort_order,
                'label' => $bonus->label,
                'value' => $bonus->value,
            ])->all());
            $this->syncProgramDays($copy, $tour->programDays->map(fn (TourProgramDay $day): array => [
                'sort_order' => $day->sort_order,
                'day_number' => $day->day_number,
                'title' => $day->title,
                'description' => $day->description,
                'image' => $day->image,
                'icon' => $day->icon,
                'experience_type' => $day->experience_type,
                'badges' => $day->badges ?? [],
                'active' => $day->active,
            ])->all());
            $this->syncGalleryItems($copy, $tour->galleryItems->map(fn ($item): array => [
                'media_id' => $item->media_id,
                'title' => $item->title,
                'alt' => $item->alt,
                'caption' => $item->caption,
                'sort_order' => $item->sort_order,
                'active' => $item->active,
            ])->all());
            $this->syncPriceItems($copy, $tour->priceItems->map(fn (TourPriceItem $item): array => [
                'type' => $item->type,
                'text' => $item->text,
                'sort_order' => $item->sort_order,
                'active' => $item->active,
            ])->all());
            $copy->departurePlaces()->sync($tour->departurePlaces->pluck('id')->all());

            return $copy;
        });

        return new TourDetailResource($duplicate->load(['region', 'dates', 'partnerBonuses', 'departurePlaces', 'media', 'priceItems', 'programDays', 'galleryItems.media']));
    }

    public function reorder(ReorderToursRequest $request)
    {
        $this->authorize('reorder', Tour::class);

        foreach ($request->validated()['ids'] as $index => $id) {
            Tour::query()->whereKey($id)->update(['sort_order' => $index + 1]);
        }

        return response()->noContent();
    }

    public function move(MoveTourRequest $request, Tour $tour)
    {
        $this->authorize('move', $tour);

        $direction = $request->validated()['direction'];
        $query = Tour::query()->orderBy('sort_order')->orderBy('id');
        $ordered = $query->get();
        $currentIndex = $ordered->search(fn (Tour $item): bool => $item->id === $tour->id);

        if ($currentIndex === false) {
            return new TourResource($tour->refresh()->load(['departurePlaces', 'media', 'priceItems', 'programDays', 'galleryItems.media']));
        }

        $swapIndex = $direction === 'up' ? $currentIndex - 1 : $currentIndex + 1;
        if (! $ordered->has($swapIndex)) {
            return new TourResource($tour->refresh()->load(['departurePlaces', 'media', 'priceItems', 'programDays', 'galleryItems.media']));
        }

        $other = $ordered->get($swapIndex);
        [$tourSortOrder, $otherSortOrder] = [$tour->sort_order, $other->sort_order];
        $tour->update(['sort_order' => $otherSortOrder]);
        $other->update(['sort_order' => $tourSortOrder]);

        return new TourResource($tour->refresh()->load(['departurePlaces', 'media', 'priceItems', 'programDays', 'galleryItems.media']));
    }

    private function syncTourDates(Tour $tour, array $dates): void
    {
        $tour->dates()->withTrashed()->get()->each->forceDelete();

        foreach ($dates as $date) {
            $tour->dates()->create([
                'start_date' => $date['start_date'] ?? null,
                'end_date' => $date['end_date'] ?? null,
                'price' => $date['price_box_price'] ?? $date['price'] ?? null,
                'price_box_price' => $date['price_box_price'] ?? $date['price'] ?? null,
                'price_box_displayed_price' => $date['price_box_displayed_price'] ?? null,
                'price_box_discount_badge' => $date['price_box_discount_badge'] ?? null,
                'price_box_min_participants' => $date['price_box_min_participants'] ?? null,
                'price_box_max_participants' => $date['price_box_max_participants'] ?? null,
                'price_box_available_seats' => $date['price_box_available_seats'] ?? null,
                'price_box_capacity' => $date['price_box_capacity'] ?? null,
                'status' => $date['status'] ?? 'planned',
            ]);
        }
    }

    private function syncPartnerBonuses(Tour $tour, array $bonuses): void
    {
        $tour->partnerBonuses()->withTrashed()->get()->each->forceDelete();

        foreach ($bonuses as $bonus) {
            $tour->partnerBonuses()->create([
                'sort_order' => $bonus['sort_order'] ?? 0,
                'label' => $bonus['label'],
                'value' => $bonus['value'] ?? null,
            ]);
        }
    }

    private function syncProgramDays(Tour $tour, array $programDays): void
    {
        $existingDays = $tour->programDays()->get()->keyBy('id');
        $requestedExistingIds = collect($programDays)
            ->map(fn (array $day) => $day['id'] ?? null)
            ->filter(fn ($id): bool => is_numeric($id) && $existingDays->has((int) $id))
            ->map(fn ($id): int => (int) $id)
            ->values()
            ->all();

        if ($requestedExistingIds === []) {
            $tour->programDays()->delete();
        } else {
            $tour->programDays()->whereNotIn('id', $requestedExistingIds)->delete();
        }

        foreach (array_values($programDays) as $index => $day) {
            $title = trim((string) ($day['title'] ?? ''));

            if ($title === '') {
                continue;
            }

            $badges = collect($day['badges'] ?? [])
                ->map(function ($badge): string {
                    if (is_array($badge)) {
                        return trim((string) ($badge['text'] ?? $badge['value'] ?? ''));
                    }

                    return trim((string) $badge);
                })
                ->filter()
                ->values()
                ->all();

            $attributes = [
                'sort_order' => (int) ($day['sort_order'] ?? ($index + 1)),
                'day_number' => (int) ($day['day_number'] ?? ($index + 1)),
                'title' => $title,
                'description' => RichTextSanitizer::sanitize($day['description'] ?? null),
                'image' => isset($day['image']) ? trim((string) $day['image']) : null,
                'icon' => isset($day['icon']) ? trim((string) $day['icon']) : null,
                'experience_type' => isset($day['experience_type']) ? trim((string) $day['experience_type']) : null,
                'badges' => $badges,
                'active' => filter_var($day['active'] ?? true, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? true,
            ];

            $existingDay = is_numeric($day['id'] ?? null)
                ? $existingDays->get((int) $day['id'])
                : null;

            if ($existingDay instanceof TourProgramDay) {
                $existingDay->update($attributes);

                continue;
            }

            $tour->programDays()->create($attributes);
        }
    }

    private function syncGalleryItems(Tour $tour, array $galleryItems): void
    {
        $tour->galleryItems()->delete();

        foreach (array_values($galleryItems) as $index => $item) {
            $mediaId = $item['media_id'] ?? null;

            if (! is_numeric($mediaId)) {
                continue;
            }

            $tour->galleryItems()->create([
                'media_id' => (int) $mediaId,
                'title' => isset($item['title']) ? trim((string) $item['title']) : null,
                'alt' => isset($item['alt']) ? trim((string) $item['alt']) : null,
                'caption' => isset($item['caption']) ? trim((string) $item['caption']) : null,
                'sort_order' => (int) ($item['sort_order'] ?? ($index + 1)),
                'active' => filter_var($item['active'] ?? true, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? true,
            ]);
        }
    }

    private function syncPriceItems(Tour $tour, array $priceItems): void
    {
        $tour->priceItems()->delete();

        foreach (array_values($priceItems) as $index => $item) {
            $text = trim(strip_tags((string) ($item['text'] ?? '')));
            $type = in_array(($item['type'] ?? 'included'), ['included', 'excluded'], true)
                ? $item['type']
                : 'included';

            if ($text === '') {
                continue;
            }

            $tour->priceItems()->create([
                'type' => $type,
                'text' => $text,
                'sort_order' => (int) ($item['sort_order'] ?? ($index + 1)),
                'active' => filter_var($item['active'] ?? true, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? true,
            ]);
        }
    }

    private function tourPriceBoxAttributes(array $validated): array
    {
        $price = $validated['price_box_price'] ?? $validated['price'] ?? null;
        $displayedPrice = $validated['price_box_displayed_price'] ?? $validated['displayed_price'] ?? null;

        return [
            'price' => $price,
            'displayed_price' => $displayedPrice,
            'price_box_price' => $price,
            'price_box_displayed_price' => $displayedPrice,
            'price_box_currency' => $validated['price_box_currency'] ?? null,
            'price_box_price_suffix' => $validated['price_box_price_suffix'] ?? null,
            'price_box_discount_badge' => $validated['price_box_discount_badge'] ?? null,
            'price_box_discount_text' => $validated['price_box_discount_text'] ?? null,
            'price_box_urgency_text' => $validated['price_box_urgency_text'] ?? null,
            'price_box_rating_text' => $validated['price_box_rating_text'] ?? null,
            'price_box_min_participants' => $validated['price_box_min_participants'] ?? null,
            'price_box_max_participants' => $validated['price_box_max_participants'] ?? null,
            'price_box_available_seats' => $validated['price_box_available_seats'] ?? null,
            'price_box_capacity' => $validated['price_box_capacity'] ?? null,
            'price_box_cta_primary_label' => $validated['price_box_cta_primary_label'] ?? null,
            'price_box_cta_secondary_label' => $validated['price_box_cta_secondary_label'] ?? null,
        ];
    }
}
