<?php

namespace App\Services\SalesAssistant\Tools;

/**
 * Argument schemas and rules the tools share.
 */
final class TripArguments
{
    /**
     * Slugs are matched exactly; legacy ones hold parentheses, colons and
     * runs of dashes, so only what a URL path segment cannot hold is refused.
     */
    private const SLUG_PATTERN = '/^[^\s\/?#%\\\\]+$/u';

    /**
     * @return array<string, mixed>
     */
    public static function slugSchema(): array
    {
        return [
            'type' => 'string',
            'description' => 'The trip slug exactly as returned by search_trips.',
        ];
    }

    /**
     * @return array<int, string>
     */
    public static function slugRules(): array
    {
        return ['required', 'string', 'max:191', 'regex:'.self::SLUG_PATTERN];
    }

    /**
     * @return array<string, mixed>
     */
    public static function departureIdSchema(string $description): array
    {
        return ['type' => 'integer', 'minimum' => 1, 'description' => $description];
    }

    /**
     * @return array<int, string>
     */
    public static function optionalIdRules(): array
    {
        return ['nullable', 'integer', 'min:1'];
    }

    /**
     * @return array<string, mixed>
     */
    public static function dateSchema(string $description): array
    {
        return ['type' => 'string', 'format' => 'date', 'description' => "{$description} Format: YYYY-MM-DD."];
    }

    /**
     * @return array<int, string>
     */
    public static function optionalDateRules(): array
    {
        return ['nullable', 'date_format:Y-m-d'];
    }

    /**
     * @param  array<string, array<string, mixed>>  $properties
     * @param  array<int, string>  $required
     * @return array<string, mixed>
     */
    public static function object(array $properties, array $required = []): array
    {
        return [
            'type' => 'object',
            'properties' => $properties,
            'required' => $required,
            'additionalProperties' => false,
        ];
    }
}
