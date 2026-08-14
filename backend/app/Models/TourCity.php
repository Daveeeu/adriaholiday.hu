<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourCity extends Model
{
    /** @use HasFactory<\Database\Factories\TourCityFactory> */
    use HasFactory;

    protected $fillable = [
        'tour_id',
        'sort_order',
        'name',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }
}
