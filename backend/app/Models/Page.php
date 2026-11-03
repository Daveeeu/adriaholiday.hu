<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use App\Support\RichTextSanitizer;
use Database\Factories\PageFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A free text page served at its own address ("/autobuszaink"), or a text
 * block: a short text without an address, kept for the office to reuse.
 */
class Page extends Model
{
    /** @use HasFactory<PageFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    public const KIND_PAGE = 'page';

    public const KIND_TEXT_BLOCK = 'text_block';

    public const KINDS = [self::KIND_PAGE, self::KIND_TEXT_BLOCK];

    protected $fillable = [
        'kind',
        'title',
        'slug',
        'content',
        'seo_title',
        'seo_description',
        'seo_robots',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::saving(function (Page $page): void {
            $page->content = RichTextSanitizer::sanitize($page->content);

            if ($page->kind === self::KIND_TEXT_BLOCK) {
                $page->slug = null;
            }
        });
    }

    /**
     * Pages visitors can open at their address.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('kind', self::KIND_PAGE)->where('active', true)->whereNotNull('slug');
    }
}
