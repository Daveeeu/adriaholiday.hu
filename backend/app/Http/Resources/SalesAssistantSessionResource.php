<?php

namespace App\Http\Resources;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A started assistant conversation: the short-lived OpenAI client secret the
 * browser opens its voice connection with, and the assistant session token
 * its catalog tool calls carry.
 *
 * @property-read array{sessionToken: string, expiresAt: CarbonImmutable, clientSecret: string, clientSecretExpiresAt: CarbonImmutable, model: string} $resource
 */
class SalesAssistantSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'sessionToken' => $this->resource['sessionToken'],
            'expiresAt' => $this->resource['expiresAt']->toISOString(),
            'clientSecret' => $this->resource['clientSecret'],
            'clientSecretExpiresAt' => $this->resource['clientSecretExpiresAt']->toISOString(),
            'model' => $this->resource['model'],
        ];
    }
}
