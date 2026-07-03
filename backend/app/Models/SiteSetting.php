<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiteSetting extends Model
{
    public const GROUPS = [
        'general',
        'brand',
        'contact',
        'social',
        'header',
        'footer',
        'cta',
        'seo',
        'analytics',
        'legal',
    ];

    public const TYPES = [
        'string',
        'text',
        'json',
        'boolean',
        'number',
        'media',
    ];

    protected $fillable = [
        'group',
        'key',
        'value',
        'type',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    public function decodedValue(): mixed
    {
        return self::decodeValue($this->value, $this->type);
    }

    public static function decodeValue(?string $value, ?string $type): mixed
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false,
            'number' => is_numeric($value) ? (str_contains($value, '.') ? (float) $value : (int) $value) : null,
            'json', 'media' => json_decode($value, true),
            default => $value,
        };
    }

    public static function encodeValue(string $type, mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return match ($type) {
            'boolean' => $value ? '1' : '0',
            'number' => is_numeric($value) ? (string) $value : null,
            'json', 'media' => json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
            default => is_scalar($value) ? trim((string) $value) : null,
        };
    }
}
