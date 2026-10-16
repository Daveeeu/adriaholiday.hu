<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * One image of an apartment's gallery: a media library item with its place
 * in the gallery. Imported images remember the legacy image they came from.
 */
class ApartmentGalleryItem extends Model
{
    protected $fillable = [
        'apartment_id',
        'media_id',
        'legacy_image_id',
        'title',
        'alt',
        'sort_order',
        'active',
    ];

    protected $casts = [
        'legacy_image_id' => 'integer',
        'sort_order' => 'integer',
        'active' => 'boolean',
    ];

    public function apartment(): BelongsTo
    {
        return $this->belongsTo(Apartment::class);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'media_id');
    }
}
