<?php

namespace App\Mcp\Tools;

use App\Models\Tour;
use App\Services\Mcp\TourBriefing;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Database\Eloquent\Builder;
use Laravel\Mcp\Request;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('search_tours')]
#[Title('Körutazások keresése')]
#[Description('Searches the tours (körutazások) by name, destination or keyword, and/or by departure dates. Returns each tour\'s id, active state, destination, duration, next departure, lowest price per person and links. Use get_tour with the id for departures, seats, booked passengers, program and photos.')]
#[IsReadOnly]
#[IsIdempotent]
class SearchToursTool extends AdminTool
{
    private const DEFAULT_LIMIT = 20;

    private const MAX_LIMIT = 50;

    public function __construct(private readonly TourBriefing $tours) {}

    protected function permission(): string
    {
        return 'tours.viewAny';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()->description('Words from the tour name, destination, country or search keywords, e.g. "Róma" or "Montenegró Albánia". Accents and case do not matter.'),
            'departure_from' => $schema->string()->format('date')->description('Only tours with a departure on or after this date (YYYY-MM-DD).'),
            'departure_to' => $schema->string()->format('date')->description('Only tours with a departure on or before this date (YYYY-MM-DD).'),
            'include_inactive' => $schema->boolean()->description('Also list inactive (switched off) tours. Default: false.'),
            'limit' => $schema->integer()->min(1)->max(self::MAX_LIMIT)->description('How many tours to return (default 20).'),
        ];
    }

    public function handle(Request $request): ResponseFactory
    {
        $validated = $request->validate([
            'query' => ['nullable', 'string', 'max:200'],
            'departure_from' => ['nullable', 'date_format:Y-m-d'],
            'departure_to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:departure_from'],
            'include_inactive' => ['nullable', 'boolean'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_LIMIT],
        ]);

        $from = $validated['departure_from'] ?? null;
        $to = $validated['departure_to'] ?? null;

        $query = Tour::query()
            ->when(! ($validated['include_inactive'] ?? false), fn (Builder $tours) => $tours->where('active', true))
            ->when(($validated['query'] ?? '') !== '', fn (Builder $tours) => $tours->adminSearch(trim($validated['query'])))
            ->when($from !== null || $to !== null, fn (Builder $tours) => $tours->whereHas('dates', fn (Builder $dates) => $dates
                ->when($from !== null, fn (Builder $dates) => $dates->whereDate('start_date', '>=', $from))
                ->when($to !== null, fn (Builder $dates) => $dates->whereDate('start_date', '<=', $to))));

        $total = (clone $query)->count();
        $tours = $query
            ->with(TourBriefing::summaryRelations())
            ->orderByDesc('active')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->limit($validated['limit'] ?? self::DEFAULT_LIMIT)
            ->get();

        return $this->respond([
            'total_count' => $total,
            'returned' => $tours->count(),
            'tours' => $tours->map(fn (Tour $tour): array => $this->tours->summary($tour))->all(),
        ]);
    }
}
