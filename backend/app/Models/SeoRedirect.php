<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Database\Factories\SeoRedirectFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * An old address answered with a permanent redirect when no page lives there
 * any more.
 * Paths are kept decoded, without the leading slash and query string
 * ("apartman/villa-damiana---žminj").
 */
class SeoRedirect extends Model
{
    /** @use HasFactory<SeoRedirectFactory> */
    use HasFactory, LogsModelActivity;

    public const ORIGIN_LEGACY = 'legacy';

    public const ORIGIN_MANUAL = 'manual';

    protected $fillable = [
        'source_path',
        'target',
        'active',
        'origin',
        'hits',
        'last_hit_at',
    ];

    protected $casts = [
        'active' => 'boolean',
        'hits' => 'integer',
        'last_hit_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saving(function (SeoRedirect $redirect): void {
            $redirect->source_path = self::normalizePath($redirect->source_path);
        });
    }

    /**
     * The form paths are kept and looked up in: decoded, without slashes at
     * either end, without query string or fragment.
     */
    public static function normalizePath(string $path): string
    {
        $path = (string) preg_replace('~[?#].*$~', '', trim($path));

        return trim(rawurldecode($path), '/');
    }
}
