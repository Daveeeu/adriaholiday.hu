<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TourReferenceOption;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TourReferenceOptionController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:tour-reference-options.create');
    }

    public function index(Request $request, string $type): array
    {
        $query = TourReferenceOption::query()
            ->where('type', $type)
            ->where('active', true)
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($search = trim((string) $request->query('search', ''))) {
            $query->where(function ($builder) use ($search): void {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        return $query->get(['code', 'name'])->map(fn (TourReferenceOption $option): array => [
            'id' => $option->code,
            'label' => $option->name,
        ])->all();
    }

    public function storeCountry(Request $request): array
    {
        return $this->store($request, 'country');
    }

    public function storeFit(Request $request): array
    {
        return $this->store($request, 'fit');
    }

    public function storeProgramType(Request $request): array
    {
        return $this->store($request, 'program-type');
    }

    public function storeTravelMode(Request $request): array
    {
        return $this->store($request, 'travel-mode');
    }

    public function storeDifficulty(Request $request): array
    {
        return $this->store($request, 'difficulty');
    }

    private function store(Request $request, string $type): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:255'],
        ]);

        $code = $validated['code'] ?? Str::slug($validated['name']);
        if ($code === '') {
            $code = Str::random(8);
        }

        $nextSortOrder = (int) TourReferenceOption::query()
            ->where('type', $type)
            ->max('sort_order');

        $option = TourReferenceOption::query()->updateOrCreate(
            ['type' => $type, 'code' => $code],
            [
                'name' => $validated['name'],
                'active' => true,
                'sort_order' => $nextSortOrder + 1,
            ],
        );

        return [
            'id' => $option->code,
            'label' => $option->name,
        ];
    }
}
