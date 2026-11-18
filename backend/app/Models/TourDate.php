<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use App\Support\Tour\TourDateStatus;
use Database\Factories\TourDateFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TourDate extends Model
{
    /** @use HasFactory<TourDateFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    /** The share of a date's capacity at or below which its seats are running low. */
    public const RUNNING_LOW_SHARE = 0.35;

    protected $fillable = [
        'tour_id',
        'sort_order',
        'start_date',
        'end_date',
        'price',
        'price_box_price',
        'price_box_original_price',
        'price_box_discount_badge',
        'price_box_label',
        'capacity',
        'status',
        'departure_place_ids',
        'accommodation',
        'accommodation_info',
        'catering',
        'catering_info',
        'xml_enabled',
        'partner_xml',
    ];

    private ?int $countedSeatsHeld = null;

    protected $casts = [
        'sort_order' => 'integer',
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
        'capacity' => 'integer',
    ];

    /**
     * Dates not yet departed (or not scheduled yet): the ones the public site
     * shows and takes bookings for.
     */
    public function scopeUpcoming(Builder $query): void
    {
        $query->where(fn (Builder $dates) => $dates
            ->whereNull('start_date')
            ->orWhereDate('start_date', '>=', today()));
    }

    /**
     * Dates whose departure day has passed: the opposite of scopeUpcoming().
     * They are soft deleted nightly (see DepartedTourDatePruner), so bookings
     * still reach them as history.
     */
    public function scopeDeparted(Builder $query): void
    {
        $query->whereDate('start_date', '<', today());
    }

    /**
     * Loads the seats the date's live bookings hold as `seats_held`, so
     * seatsHeld() and freeSeats() need no query per date.
     */
    public function scopeWithSeatsHeld(Builder $query): void
    {
        $query->withSum(['bookings as seats_held' => fn (Builder $bookings) => $bookings->holdingSeats()], DB::raw(Booking::SEATS_HELD));
    }

    /**
     * Passengers of the date's live bookings (see Booking::scopeHoldingSeats()):
     * the figure scopeWithSeatsHeld() loaded, else counted once for this instance
     * (kept off the attributes, so a later save does not try to write it).
     */
    public function seatsHeld(): int
    {
        if (array_key_exists('seats_held', $this->attributes)) {
            return (int) $this->attributes['seats_held'];
        }

        return $this->countedSeatsHeld ??= (int) $this->bookings()->holdingSeats()->sum(DB::raw(Booking::SEATS_HELD));
    }

    /** Seats still free: the capacity less the seats held; null when the date has no limit. */
    public function freeSeats(): ?int
    {
        return $this->capacity === null ? null : max(0, $this->capacity - $this->seatsHeld());
    }

    /**
     * Whether so few seats are left that the trip page urges the visitor to
     * book: some, but at most RUNNING_LOW_SHARE of the capacity.
     */
    public function seatsRunningLow(): bool
    {
        $free = $this->freeSeats();

        return $free !== null && $free > 0 && $free <= $this->capacity * self::RUNNING_LOW_SHARE;
    }

    /**
     * The status the site goes by: a date on sale whose seats are all taken
     * is sold out, whatever the office last set.
     */
    public function effectiveStatus(): ?string
    {
        return TourDateStatus::isBookable($this->status) && $this->freeSeats() === 0
            ? TourDateStatus::SOLD_OUT
            : $this->status;
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
