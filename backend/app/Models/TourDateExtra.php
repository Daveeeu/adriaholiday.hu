<?php

namespace App\Models;

use Database\Factories\TourDateExtraFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourDateExtra extends Model
{
    /** @use HasFactory<TourDateExtraFactory> */
    use HasFactory;

    protected $fillable = [
        'tour_date_id',
        'name',
        'price',
        'price_unit',
        'mandatory',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'mandatory' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function tourDate(): BelongsTo
    {
        return $this->belongsTo(TourDate::class);
    }
}
