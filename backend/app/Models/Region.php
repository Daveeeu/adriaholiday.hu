<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Database\Factories\RegionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Region extends Model implements HasMedia
{
    /** @use HasFactory<RegionFactory> */
    use HasFactory, InteractsWithMedia, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'slug',
        'name',
        'country_code',
        'timezone',
        'currency',
        'hero_image_url',
        'summary',
        'description',
        'is_active',
        'sort_order',
        'portfolio_featured',
        'portfolio_sort_order',
        'portfolio_image_url',
        'portfolio_short_description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'portfolio_featured' => 'boolean',
        'portfolio_sort_order' => 'integer',
    ];

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }

    public function galleries(): HasMany
    {
        return $this->hasMany(Gallery::class);
    }

    public function apartments(): HasMany
    {
        return $this->hasMany(Apartment::class);
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('portfolio-image')->singleFile()->useDisk(config('media-library.disk_name'));
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->fit(Fit::Crop, 640, 360)
            ->nonQueued();

        $this->addMediaConversion('preview')
            ->fit(Fit::Crop, 960, 540)
            ->nonQueued();

        $this->addMediaConversion('large')
            ->fit(Fit::Crop, 1600, 900)
            ->nonQueued();
    }
}
