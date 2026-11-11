<?php

namespace App\Mcp\Tools;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourGalleryItem;
use App\Services\Mcp\McpImages;
use App\Services\Mcp\TourBriefing;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get_tour')]
#[Title('Körutazás részletei')]
#[Description('Everything about one tour by id or web address (slug): every upcoming departure with its price, seat status, capacity and booked passengers by booking status, extras, boarding places and fees, the day-by-day program, what the price includes and excludes, and links. Also sends the tour\'s photos as images (set images to 0 to skip them).')]
#[IsReadOnly]
#[IsIdempotent]
class GetTourTool extends AdminTool
{
    private const DEFAULT_IMAGES = 2;

    private const MAX_IMAGES = 6;

    public function __construct(
        private readonly TourBriefing $tours,
        private readonly McpImages $images,
    ) {}

    protected function permission(): string
    {
        return 'tours.view';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('The tour id (from search_tours).'),
            'slug' => $schema->string()->description('Or the tour\'s web address, e.g. "montenegro-albania-korutazas" from adriaholiday.hu/ajanlat/montenegro-albania-korutazas.'),
            'images' => $schema->integer()->min(0)->max(self::MAX_IMAGES)->description('How many photos to send, main image first (default 2, max 6).'),
        ];
    }

    public function handle(Request $request): ResponseFactory|Response
    {
        $validated = $request->validate([
            'id' => ['nullable', 'integer', 'required_without:slug'],
            'slug' => ['nullable', 'string', 'max:255', 'required_without:id'],
            'images' => ['nullable', 'integer', 'min:0', 'max:'.self::MAX_IMAGES],
        ]);

        $tour = Tour::query()
            ->with(TourBriefing::detailRelations())
            ->when(isset($validated['id']), fn ($tours) => $tours->whereKey($validated['id']), fn ($tours) => $tours->where('seo_name', $validated['slug']))
            ->first();

        if ($tour === null) {
            return Response::error('Nincs ilyen körutazás. Keresd meg a search_tours eszközzel.');
        }

        $occupancy = $this->user($request)->can('viewAny', Booking::class) ? $this->tours->occupancy($tour) : null;

        return $this->respond($this->tours->details($tour, $occupancy), $this->photos($tour, $validated['images'] ?? self::DEFAULT_IMAGES));
    }

    /**
     * @return array<int, Response>
     */
    private function photos(Tour $tour, int $count): array
    {
        $main = $tour->mainImage();
        $media = collect([$main])
            ->merge($this->tours->galleryItems($tour)->map(fn (TourGalleryItem $item) => $item->media))
            ->filter()
            ->unique('id');

        return $media
            ->map(fn ($item): ?Response => $this->images->fromMedia($item))
            ->filter()
            ->take($count)
            ->values()
            ->all();
    }
}
