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
use Illuminate\Support\Collection;

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
        'departure_place_ids',
        'accommodation',
        'accommodation_info',
        'catering',
        'catering_info',
        'xml_enabled',
        'partner_xml',
    ];

    protected $casts = [
        'departure_place_ids' => 'array',
        'xml_enabled' => 'boolean',
        'partner_xml' => 'array',
        'legacy_id' => 'integer',
        'legacy_attributes' => 'array',
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

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function extras(): HasMany
    {
        return $this->hasMany(TourDateExtra::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * The departure places of the tour this date offers: all of them, unless
     * the date names some.
     *
     * @param  Collection<int, TourDeparturePlace>  $places
     * @return Collection<int, TourDeparturePlace>
     */
    public function offeredDeparturePlaces(Collection $places): Collection
    {
        $ids = array_map('intval', $this->departure_place_ids ?? []);

        return $ids === [] ? $places : $places->whereIn('id', $ids)->values();
    }
}
