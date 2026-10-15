<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * A file of the legacy website (gallery image, slider image, PDF, image in a
 * text) and the media library item it was mirrored to, or why it was not.
 */
class LegacyMediaFile extends Model
{
    public const MIRRORED = 'mirrored';

    public const FAILED = 'failed';

    protected $fillable = [
        'legacy_url',
        'legacy_url_sha256',
        'content_sha256',
        'media_id',
        'status',
        'http_status',
        'error',
        'bytes',
        'attempts',
        'last_attempt_at',
    ];

    protected $casts = [
        'media_id' => 'integer',
        'http_status' => 'integer',
        'bytes' => 'integer',
        'attempts' => 'integer',
        'last_attempt_at' => 'datetime',
    ];

    public static function urlHash(string $url): string
    {
        return hash('sha256', $url);
    }

    public function scopeForUrl(Builder $query, string $url): void
    {
        $query->where('legacy_url_sha256', self::urlHash($url));
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'media_id');
    }
}
