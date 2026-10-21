<?php

namespace App\Http\Resources;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A started assistant conversation: the Retell web call the browser joins
 * (with its short-lived access token), and the assistant session token the
 * browser follows the recommended trips with.
 *
 * @property-read array{sessionToken: string, expiresAt: CarbonImmutable, call: array{call_id: string, access_token: string, transport: string|null, url: string|null, ice_servers: array<int, mixed>|null, expires_at: int|null}} $resource
 */
class SalesAssistantSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $call = $this->resource['call'];

        return [
            'sessionToken' => $this->resource['sessionToken'],
            'expiresAt' => $this->resource['expiresAt']->toISOString(),
            'call' => [
                'callId' => $call['call_id'],
                'accessToken' => $call['access_token'],
                'accessTokenExpiresAt' => $call['expires_at'],
                'transport' => $call['transport'],
                'url' => $call['url'],
                'iceServers' => $call['ice_servers'],
            ],
        ];
    }
}
