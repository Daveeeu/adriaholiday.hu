<?php

namespace App\Models;

use App\Http\Resources\MediaResource;
use App\Support\RichTextSanitizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

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
        'newsletter',
        'booking',
    ];

    public const TYPES = [
        'string',
        'text',
        'richtext',
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

    /**
     * Decoded values of the given keys of a group, keyed by setting key;
     * keys without a stored row are missing from the result.
     *
     * @param  array<int, string>  $keys
     * @return Collection<string, mixed>
     */
    public static function valuesOf(string $group, array $keys): Collection
    {
        return self::query()
            ->where('group', $group)
            ->whereIn('key', $keys)
            ->get()
            ->mapWithKeys(fn (SiteSetting $setting): array => [$setting->key => $setting->decodedValue()]);
    }

    public function decodedValue(): mixed
    {
        $value = self::decodeValue($this->value, $this->type);

        return $this->type === 'media' ? self::currentMedia($value) : $value;
    }

    /**
     * A media setting stores a snapshot of the chosen media item, whose absolute URLs go stale
     * once the site runs on another domain; the item's current data is served instead.
     *
     * @return array<string, mixed>|null
     */
    private static function currentMedia(mixed $stored): ?array
    {
        $mediaId = is_array($stored) ? ($stored['id'] ?? null) : null;
        $media = is_numeric($mediaId) ? Media::query()->find((int) $mediaId) : null;

        return $media !== null ? (new MediaResource($media))->resolve() : null;
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

        if ($type === 'richtext') {
            return is_string($value) ? (RichTextSanitizer::sanitize($value) ?: null) : null;
        }

        return match ($type) {
            'boolean' => $value ? '1' : '0',
            'number' => is_numeric($value) ? (string) $value : null,
            'json', 'media' => json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
            default => is_scalar($value) ? trim((string) $value) : null,
        };
    }
}
