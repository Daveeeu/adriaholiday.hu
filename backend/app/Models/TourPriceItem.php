<?php

namespace App\Models;

use Database\Factories\TourPriceItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourPriceItem extends Model
{
    /** @use HasFactory<TourPriceItemFactory> */
    use HasFactory;

    protected $fillable = [
        'tour_id',
        'type',
        'text',
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
}
