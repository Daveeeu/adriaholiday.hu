<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\LogsModelActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Image\Enums\Fit;

class BlogArticle extends Model implements HasMedia
{
    /** @use HasFactory<\Database\Factories\BlogArticleFactory> */
    use HasFactory, InteractsWithMedia, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'active',
        'published_at',
        'show_on_homepage',
        'portfolio_featured',
        'portfolio_sort_order',
        'image',
        'image_title',
        'views',
        'sort_order',
    ];

    protected $casts = [
        'active' => 'boolean',
        'show_on_homepage' => 'boolean',
        'portfolio_featured' => 'boolean',
        'published_at' => 'datetime',
        'views' => 'integer',
        'portfolio_sort_order' => 'integer',
        'sort_order' => 'integer',
    ];

    public function translations(): HasMany
    {
        return $this->hasMany(BlogArticleTranslation::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(BlogCategory::class, 'blog_article_category');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(BlogTag::class, 'blog_article_tag');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('cover')->singleFile()->useDisk(config('media-library.disk_name'));
    }

    public function registerMediaConversions(?\Spatie\MediaLibrary\MediaCollections\Models\Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->fit(Fit::Crop, 480, 320)
            ->nonQueued();

        $this->addMediaConversion('preview')
            ->fit(Fit::Crop, 960, 640)
            ->nonQueued();

        $this->addMediaConversion('large')
            ->fit(Fit::Crop, 1600, 1067)
            ->nonQueued();
    }
}
