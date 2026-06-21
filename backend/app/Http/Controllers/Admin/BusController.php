<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\RespondsWithPagination;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Bus\StoreBusRequest;
use App\Http\Requests\Admin\Bus\UpdateBusRequest;
use App\Http\Resources\BusDetailResource;
use App\Http\Resources\BusResource;
use App\Models\Bus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BusController extends Controller
{
    use RespondsWithPagination;

    public function __construct()
    {
        $this->authorizeResource(Bus::class, 'bus');
        $this->middleware('permission:buses.viewAny')->only('index');
        $this->middleware('permission:buses.view')->only('show');
        $this->middleware('permission:buses.create')->only('store');
        $this->middleware('permission:buses.update')->only('update');
        $this->middleware('permission:buses.delete')->only('destroy');
    }

    public function index(Request $request)
    {
        $query = Bus::query()->with('translations');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('vehicle_code', 'like', "%{$search}%")
                    ->orWhereHas('translations', function ($translationQuery) use ($search): void {
                        $translationQuery->where('name', 'like', "%{$search}%")
                            ->orWhere('seo_name', 'like', "%{$search}%");
                    });
            });
        }

        $sortBy = Str::snake((string) $request->query('sort_by', $request->query('sortBy', 'sort_order')));
        $perPage = (int) $request->query('per_page', $request->query('perPage', 25));
        $sortDirection = $request->query('sort_direction', $request->query('sortDirection', 'asc'));
        $allowedSorts = ['id', 'name', 'vehicle_code', 'active', 'sort_order', 'created_at'];
        if (! in_array($sortBy, $allowedSorts, true)) {
            $sortBy = 'sort_order';
        }

        $direction = $sortDirection === 'desc' ? 'desc' : 'asc';
        if ($sortBy === 'name') {
            $query->orderByRaw(
                "(select name from bus_translations where bus_translations.bus_id = buses.id and locale = 'hu' limit 1) {$direction}"
            );
        } else {
            $query->orderBy($sortBy, $direction);
        }

        $paginator = $query->paginate($perPage);

        return $this->paginated(BusResource::class, $paginator);
    }

    public function store(StoreBusRequest $request)
    {
        $validated = $request->validated();

        $bus = DB::transaction(function () use ($validated): Bus {
            $bus = Bus::create([
                'active' => $validated['active'] ?? true,
                'sort_order' => $validated['sort_order'] ?? 0,
                'vehicle_code' => $validated['vehicle_code'],
            ]);

            $this->syncTranslations($bus, $validated['translations']);

            return $bus;
        });

        return new BusDetailResource($bus->load('translations'));
    }

    public function show(Bus $bus)
    {
        return new BusDetailResource($bus->load('translations'));
    }

    public function update(UpdateBusRequest $request, Bus $bus)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($bus, $validated): void {
            $bus->update([
                'active' => $validated['active'] ?? true,
                'sort_order' => $validated['sort_order'] ?? 0,
                'vehicle_code' => $validated['vehicle_code'],
            ]);

            $this->syncTranslations($bus, $validated['translations']);
        });

        return new BusDetailResource($bus->refresh()->load('translations'));
    }

    public function destroy(Bus $bus)
    {
        $bus->delete();

        return response()->noContent();
    }

    /**
     * @param array<string, array<string, mixed>> $translations
     */
    private function syncTranslations(Bus $bus, array $translations): void
    {
        foreach ($translations as $locale => $translation) {
            $bus->translations()->updateOrCreate(
                ['locale' => $locale],
                [
                    'name' => $translation['name'],
                    'seo_name' => $translation['seo_name'],
                    'seo_auto_generate' => (bool) ($translation['seo_auto_generate'] ?? true),
                ],
            );
        }
    }
}
