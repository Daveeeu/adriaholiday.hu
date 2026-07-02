<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Image\Enums\Fit;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class AdminMediaItem extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, LogsModelActivity;

    protected $fillable = [];

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('library')->singleFile()->useDisk(config('media-library.disk_name'));
    }

    public function registerMediaConversions(?\Spatie\MediaLibrary\MediaCollections\Models\Media $media = null): void
    {
        $this->addMediaConversion('thumbnail')
            ->fit(Fit::Crop, 480, 320)
            ->nonQueued();

        $this->addMediaConversion('preview')
            ->fit(Fit::Crop, 960, 640)
            ->nonQueued();
    }
}
