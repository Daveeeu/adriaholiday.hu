<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A tour's place on one public list (see App\Support\Tour\TourList).
 */
class TourListPosition extends Model
{
    protected $fillable = [
        'list_type',
        'list_key',
        'tour_id',
        'position',
    ];

    protected $casts = [
        'position' => 'integer',
    ];

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }
}
