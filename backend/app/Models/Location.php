<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Database\Factories\LocationFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Location extends Model
{
    /** @use HasFactory<LocationFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'legacy_id',
        'region_id',
        'slug',
        'area_slug',
        'area_name',
        'name',
        'type',
        'latitude',
        'longitude',
        'transfer_minutes_from_airport',
        'description',
        'guide',
        'apartment_information',
        'seo_title',
        'seo_description',
        'seo_robots',
        'featured',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'legacy_id' => 'integer',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'transfer_minutes_from_airport' => 'integer',
        'featured' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function apartments(): HasMany
    {
        return $this->hasMany(Apartment::class);
    }

    /**
     * Locations with a public apartment page (/apartmanok/{area}/{slug}):
     * active, with an area and at least one public apartment.
     *
     * @param  Builder<Location>  $query
     */
    public function scopeWithApartmentPage(Builder $query): void
    {
        $query->where('is_active', true)
            ->whereNotNull('area_slug')
            ->whereHas('apartments', fn (Builder $apartments) => $apartments->publiclyVisible());
    }

    public function apartmentPagePath(): string
    {
        return "/apartmanok/{$this->area_slug}/{$this->slug}";
    }
}
