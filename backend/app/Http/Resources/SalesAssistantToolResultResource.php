<?php

namespace App\Http\Resources;

use App\Services\SalesAssistant\Tools\SalesAssistantToolResult;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A tool call's answer: `result` goes back to the model, `display` is for the
 * demo page (the trips as the site's offer cards show them).
 *
 * @property-read SalesAssistantToolResult $resource
 */
class SalesAssistantToolResultResource extends JsonResource
{
    public function __construct(SalesAssistantToolResult $result, private readonly string $tool)
    {
        parent::__construct($result);
    }

    public function toArray(Request $request): array
    {
        return [
            'tool' => $this->tool,
            'result' => $this->resource->result,
            'display' => [
                'trips' => PortfolioFeaturedTourResource::collection($this->resource->trips)->resolve($request),
                'replacesRecommendations' => $this->resource->replacesRecommendations,
            ],
        ];
    }
}
