<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TourDate extends Model
{
    /** @use HasFactory<\Database\Factories\TourDateFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'tour_id',
        'start_date',
        'end_date',
        'price',
        'price_box_price',
        'price_box_displayed_price',
        'price_box_discount_badge',
        'price_box_min_participants',
        'price_box_max_participants',
        'price_box_available_seats',
        'price_box_capacity',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'price' => 'decimal:2',
        'price_box_price' => 'decimal:2',
        'price_box_min_participants' => 'integer',
        'price_box_max_participants' => 'integer',
        'price_box_available_seats' => 'integer',
        'price_box_capacity' => 'integer',
    ];

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }
}
