<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Database\Factories\TourDateFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TourDate extends Model
{
    /** @use HasFactory<TourDateFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'tour_id',
        'start_date',
        'end_date',
        'price',
        'price_box_price',
        'price_box_original_price',
        'price_box_displayed_price',
        'price_box_discount_badge',
        'price_box_label',
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
        'price_box_original_price' => 'decimal:2',
        'price_box_min_participants' => 'integer',
        'price_box_max_participants' => 'integer',
        'price_box_available_seats' => 'integer',
        'price_box_capacity' => 'integer',
    ];

    /**
     * Dates not yet departed (or not scheduled yet): the ones the public site
     * shows and takes bookings for. Departed dates stay stored as history.
     */
    public function scopeUpcoming(Builder $query): void
    {
        $query->where(fn (Builder $dates) => $dates
            ->whereNull('start_date')
            ->orWhereDate('start_date', '>=', today()));
    }

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }

    public function extras(): HasMany
    {
        return $this->hasMany(TourDateExtra::class)->orderBy('sort_order')->orderBy('id');
    }
}
