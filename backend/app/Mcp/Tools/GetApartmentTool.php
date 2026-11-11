<?php

namespace App\Mcp\Tools;

use App\Models\Apartment;
use App\Models\ApartmentGalleryItem;
use App\Services\Mcp\ApartmentBriefing;
use App\Services\Mcp\McpImages;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('get_apartment')]
#[Title('Apartman részletei')]
#[Description('One apartment by id: rooms, guests, distances, address, description, services, the upcoming nightly price table (EUR per apartment per night) and links. Also sends its photos as images (set images to 0 to skip them).')]
#[IsReadOnly]
#[IsIdempotent]
class GetApartmentTool extends AdminTool
{
    private const DEFAULT_IMAGES = 2;

    private const MAX_IMAGES = 6;

    public function __construct(
        private readonly ApartmentBriefing $apartments,
        private readonly McpImages $images,
    ) {}

    protected function permission(): string
    {
        return 'apartments.view';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'id' => $schema->integer()->description('The apartment id (from search_apartments).')->required(),
            'images' => $schema->integer()->min(0)->max(self::MAX_IMAGES)->description('How many photos to send (default 2, max 6).'),
        ];
    }

    public function handle(Request $request): ResponseFactory|Response
    {
        $validated = $request->validate([
            'id' => ['required', 'integer'],
            'images' => ['nullable', 'integer', 'min:0', 'max:'.self::MAX_IMAGES],
        ]);

        $apartment = Apartment::query()->with(ApartmentBriefing::relations())->find($validated['id']);

        if ($apartment === null) {
            return Response::error('Nincs ilyen apartman. Keresd meg a search_apartments eszközzel.');
        }

        $photos = $this->apartments->galleryItems($apartment)
            ->map(fn (ApartmentGalleryItem $item): ?Response => $this->images->fromMedia($item->media))
            ->filter()
            ->take($validated['images'] ?? self::DEFAULT_IMAGES)
            ->values()
            ->all();

        return $this->respond($this->apartments->details($apartment), $photos);
    }
}
