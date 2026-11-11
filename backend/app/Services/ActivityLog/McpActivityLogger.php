<?php

namespace App\Services\ActivityLog;

use App\Models\User;
use App\Support\ActivityLog\ActivityEvents;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

/**
 * Records every tool an AI assistant called through the MCP server: who
 * asked, through which assistant, and with what arguments. The answers
 * carry customer data, so the office can always see who looked at what.
 */
class McpActivityLogger
{
    private const MAX_ARGUMENT_LENGTH = 200;

    /**
     * @param  array<string, mixed>  $arguments
     */
    public function toolCalled(User $user, string $tool, array $arguments, ?string $client, Request $request): void
    {
        activity(ActivityEvents::MCP_LOG_NAME)
            ->event(ActivityEvents::AI_QUERY)
            ->causedBy($user)
            ->withProperties([
                'tool' => Str::limit($tool, 100, ''),
                'arguments' => $this->shorten($arguments),
                'client' => $client !== null ? Str::limit($client, 100, '') : null,
                'ip' => $request->ip(),
                'user_agent' => Str::limit((string) $request->userAgent(), 500, ''),
            ])
            ->log('AI lekérdezés: '.Str::limit($tool, 100, ''));
    }

    /**
     * @param  array<string, mixed>  $arguments
     * @return array<string, mixed>
     */
    private function shorten(array $arguments): array
    {
        return collect($arguments)
            ->take(20)
            ->map(fn (mixed $value): mixed => match (true) {
                is_string($value) => Str::limit($value, self::MAX_ARGUMENT_LENGTH),
                is_scalar($value), $value === null => $value,
                default => Str::limit((string) json_encode($value, JSON_UNESCAPED_UNICODE), self::MAX_ARGUMENT_LENGTH),
            })
            ->all();
    }
}
