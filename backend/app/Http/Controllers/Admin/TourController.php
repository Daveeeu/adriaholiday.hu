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
        $query = Tour::query()->with(['region', 'departurePlaces', 'media']);

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

        $tour = DB::transaction(function () use ($validated): Tour {
            $tour = Tour::create([
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
                'list_description' => $validated['list_description'] ?? null,
                'short_description' => $validated['short_description'] ?? null,
                'program_pdf_path' => $validated['program_pdf_path'] ?? null,
                'program_pdf_file' => $validated['program_pdf_file'] ?? null,
                'slider_image' => $validated['slider_image'] ?? null,
                'program_before' => $validated['program_before'] ?? null,
                'program' => $validated['program'] ?? null,
                'inclusions' => $validated['inclusions'] ?? null,
                'payment_program' => $validated['payment_program'] ?? null,
                'prices' => $validated['prices'] ?? null,
                'discounts' => $validated['discounts'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'region_id' => $validated['region_id'] ?? null,
                'group_id' => $validated['group_id'] ?? null,
                'seasonal_group_id' => $validated['seasonal_group_id'] ?? null,
                'fit_id' => $validated['fit_id'] ?? null,
                'program_type_id' => $validated['program_type_id'] ?? null,
                'travel_mode_id' => $validated['travel_mode_id'] ?? null,
                'difficulty_id' => $validated['difficulty_id'] ?? null,
                'country_ids' => $validated['country_ids'] ?? [],
                'tag_ids' => $validated['tag_ids'] ?? [],
                'category_ids' => $validated['category_ids'] ?? [],
                'price' => $validated['price'] ?? null,
                'displayed_price' => $validated['displayed_price'] ?? null,
                'slider_text' => $validated['slider_text'] ?? null,
            ]);

            $this->syncTourDates($tour, $validated['dates'] ?? []);
            $this->syncPartnerBonuses($tour, $validated['partner_bonuses'] ?? []);
            $tour->departurePlaces()->sync($validated['departure_place_ids'] ?? []);

            return $tour;
        });

        return new TourDetailResource($tour->load(['region', 'dates', 'partnerBonuses', 'departurePlaces', 'media']));
    }

    public function show(Tour $tour)
    {
        return new TourDetailResource($tour->load(['region', 'dates', 'partnerBonuses', 'departurePlaces', 'media']));
    }

    public function update(UpdateTourRequest $request, Tour $tour)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($tour, $validated): void {
            $tour->update([
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
                'list_description' => $validated['list_description'] ?? null,
                'short_description' => $validated['short_description'] ?? null,
                'program_pdf_path' => $validated['program_pdf_path'] ?? null,
                'program_pdf_file' => $validated['program_pdf_file'] ?? null,
                'slider_image' => $validated['slider_image'] ?? null,
                'program_before' => $validated['program_before'] ?? null,
                'program' => $validated['program'] ?? null,
                'inclusions' => $validated['inclusions'] ?? null,
                'payment_program' => $validated['payment_program'] ?? null,
                'prices' => $validated['prices'] ?? null,
                'discounts' => $validated['discounts'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'region_id' => $validated['region_id'] ?? null,
                'group_id' => $validated['group_id'] ?? null,
                'seasonal_group_id' => $validated['seasonal_group_id'] ?? null,
                'fit_id' => $validated['fit_id'] ?? null,
                'program_type_id' => $validated['program_type_id'] ?? null,
                'travel_mode_id' => $validated['travel_mode_id'] ?? null,
                'difficulty_id' => $validated['difficulty_id'] ?? null,
                'country_ids' => $validated['country_ids'] ?? [],
                'tag_ids' => $validated['tag_ids'] ?? [],
                'category_ids' => $validated['category_ids'] ?? [],
                'price' => $validated['price'] ?? null,
                'displayed_price' => $validated['displayed_price'] ?? null,
                'slider_text' => $validated['slider_text'] ?? null,
            ]);

            $this->syncTourDates($tour, $validated['dates'] ?? []);
            $this->syncPartnerBonuses($tour, $validated['partner_bonuses'] ?? []);
            $tour->departurePlaces()->sync($validated['departure_place_ids'] ?? []);
        });

        return new TourDetailResource($tour->refresh()->load(['region', 'dates', 'partnerBonuses', 'departurePlaces', 'media']));
    }

    public function destroy(Tour $tour)
    {
        $tour->delete();

        return response()->noContent();
    }

    public function status(UpdateTourStatusRequest $request, Tour $tour)
    {
        $this->authorize('status', $tour);

        $tour->update(['active' => $request->validated()['active']]);

        return new TourResource($tour->refresh()->load(['departurePlaces', 'media']));
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

            $tour->load(['dates', 'partnerBonuses', 'departurePlaces']);
            $this->syncTourDates($copy, $tour->dates->map(fn (TourDate $date): array => [
                'start_date' => $date->start_date?->toDateString(),
                'end_date' => $date->end_date?->toDateString(),
                'price' => $date->price,
                'status' => $date->status,
            ])->all());
            $this->syncPartnerBonuses($copy, $tour->partnerBonuses->map(fn ($bonus): array => [
                'sort_order' => $bonus->sort_order,
                'label' => $bonus->label,
                'value' => $bonus->value,
            ])->all());
            $copy->departurePlaces()->sync($tour->departurePlaces->pluck('id')->all());

            return $copy;
        });

        return new TourDetailResource($duplicate->load(['region', 'dates', 'partnerBonuses', 'departurePlaces', 'media']));
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
            return new TourResource($tour->refresh());
        }

        $swapIndex = $direction === 'up' ? $currentIndex - 1 : $currentIndex + 1;
        if (! $ordered->has($swapIndex)) {
            return new TourResource($tour->refresh());
        }

        $other = $ordered->get($swapIndex);
        [$tourSortOrder, $otherSortOrder] = [$tour->sort_order, $other->sort_order];
        $tour->update(['sort_order' => $otherSortOrder]);
        $other->update(['sort_order' => $tourSortOrder]);

        return new TourResource($tour->refresh()->load('departurePlaces'));
    }

    private function syncTourDates(Tour $tour, array $dates): void
    {
        $tour->dates()->withTrashed()->get()->each->forceDelete();

        foreach ($dates as $date) {
            $tour->dates()->create([
                'start_date' => $date['start_date'] ?? null,
                'end_date' => $date['end_date'] ?? null,
                'price' => $date['price'] ?? null,
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
}
