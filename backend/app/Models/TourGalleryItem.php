<?php

namespace App\Models;

use Database\Factories\TourGalleryItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class TourGalleryItem extends Model
{
    /** @use HasFactory<TourGalleryItemFactory> */
    use HasFactory;

    /** The tour's gallery, shown on its page. */
    public const MAIN = 'main';

    /** Images of the legacy offer's intro gallery, kept but not shown. */
    public const INTRO = 'intro';

    /** A legacy offer's program gallery when it differs from its main one, kept but not shown. */
    public const PROGRAM = 'program';

    protected $fillable = [
        'tour_id',
        'media_id',
        'collection',
        'title',
        'alt',
        'caption',
        'sort_order',
        'active',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'active' => 'boolean',
    ];

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'media_id');
    }
}
