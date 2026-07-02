<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourProgramDay extends Model
{
    /** @use HasFactory<\Database\Factories\TourProgramDayFactory> */
    use HasFactory;

    protected $fillable = [
        'tour_id',
        'sort_order',
        'day_number',
        'title',
        'description',
        'image',
        'icon',
        'experience_type',
        'badges',
        'active',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'day_number' => 'integer',
        'active' => 'boolean',
        'badges' => 'array',
    ];

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }
}
