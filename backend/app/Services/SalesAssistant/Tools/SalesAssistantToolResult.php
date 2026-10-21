<?php

namespace App\Services\SalesAssistant\Tools;

use App\Models\Tour;
use Illuminate\Support\Collection;

/**
 * What a tool call answers: the data the model reads, and the trips the demo
 * page shows as cards next to the conversation (the ones the model is
 * talking about). A search replaces the cards shown; a question about one
 * trip brings that trip's card to the front.
 */
final class SalesAssistantToolResult
{
    /**
     * @param  array<string, mixed>  $result  for the model
     * @param  Collection<int, Tour>  $trips  for the page, loaded with TripCatalog::cardRelations()
     */
    public function __construct(
        public readonly array $result,
        public readonly Collection $trips = new Collection,
        public readonly bool $replacesRecommendations = false,
    ) {}
}
