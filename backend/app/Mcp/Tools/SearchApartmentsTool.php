<?php

namespace App\Mcp\Tools;

use App\Models\Apartment;
use App\Services\Mcp\ApartmentBriefing;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Database\Eloquent\Builder;
use Laravel\Mcp\Request;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('search_apartments')]
#[Title('Apartmanok keresése')]
#[Description('Searches the apartments (e.g. in Bibione) by name, code or web address, place and size. Returns stars, guests, distance to the sea, the lowest upcoming nightly price in EUR and links. Use get_apartment for the price table, services and photos.')]
#[IsReadOnly]
#[IsIdempotent]
class SearchApartmentsTool extends AdminTool
{
    private const DEFAULT_LIMIT = 20;

    private const MAX_LIMIT = 50;

    public function __construct(private readonly ApartmentBriefing $apartments) {}

    protected function permission(): string
    {
        return 'apartments.viewAny';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'search' => $schema->string()->description('Text in the apartment name, code or web address.'),
            'location' => $schema->string()->description('Part of the place name, e.g. "Bibione".'),
            'min_guests' => $schema->integer()->min(1)->description('Sleeps at least this many guests.'),
            'include_inactive' => $schema->boolean()->description('Also list inactive or unpublished apartments. Default: false.'),
            'limit' => $schema->integer()->min(1)->max(self::MAX_LIMIT)->description('How many apartments to return (default 20).'),
        ];
    }

    public function handle(Request $request): ResponseFactory
    {
        $validated = $request->validate([
            'search' => ['nullable', 'string', 'max:200'],
            'location' => ['nullable', 'string', 'max:100'],
            'min_guests' => ['nullable', 'integer', 'min:1'],
            'include_inactive' => ['nullable', 'boolean'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_LIMIT],
        ]);

        $query = Apartment::query()
            ->when(! ($validated['include_inactive'] ?? false), fn (Builder $apartments) => $apartments->publiclyVisible())
            ->when(($validated['search'] ?? '') !== '', fn (Builder $apartments) => $apartments->adminSearch(trim($validated['search'])))
            ->when(($validated['location'] ?? '') !== '', fn (Builder $apartments) => $apartments->whereHas('location', fn (Builder $locations) => $locations->where('name', 'like', '%'.trim($validated['location']).'%')))
            ->when(isset($validated['min_guests']), fn (Builder $apartments) => $apartments->where('max_guests', '>=', $validated['min_guests']));

        $total = (clone $query)->count();
        $apartments = $query->with(ApartmentBriefing::relations())->orderBy('name')->limit($validated['limit'] ?? self::DEFAULT_LIMIT)->get();

        return $this->respond([
            'total_count' => $total,
            'returned' => $apartments->count(),
            'apartments' => $apartments->map(fn (Apartment $apartment): array => $this->apartments->summary($apartment))->all(),
        ]);
    }
}
