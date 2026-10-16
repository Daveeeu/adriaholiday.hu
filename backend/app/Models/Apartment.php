<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Database\Factories\ApartmentFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Apartment extends Model
{
    /** @use HasFactory<ApartmentFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    public const STATUS_DRAFT = 'draft';

    public const STATUS_PUBLISHED = 'published';

    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'legacy_id',
        'region_id',
        'location_id',
        'gallery_id',
        'type',
        'name',
        'slug',
        'code',
        'seo_name',
        'seo_auto_generate',
        'seo_title',
        'seo_description',
        'seo_robots',
        'is_active',
        'featured',
        'is_accommodation',
        'stars',
        'bedrooms',
        'bathrooms',
        'max_guests',
        'size_m2',
        'distance_to_center_m',
        'distance_to_sea_m',
        'address',
        'map_address',
        'latitude',
        'longitude',
        'coordinates',
        'short_description',
        'description',
        'additional_information',
        'apartment_type_content',
        'apartment_type_description',
        'apartment_type_text_description',
        'apartment_type_text_description_2',
        'all_inclusive_description',
        'price_header',
        'price_inner_header',
        'pricing_matrix',
        'price_seasons',
        'amenities',
        'services',
        'legacy_attributes',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'legacy_id' => 'integer',
        'is_active' => 'boolean',
        'featured' => 'boolean',
        'is_accommodation' => 'boolean',
        'seo_auto_generate' => 'boolean',
        'stars' => 'integer',
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'max_guests' => 'integer',
        'size_m2' => 'decimal:2',
        'distance_to_center_m' => 'integer',
        'distance_to_sea_m' => 'integer',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'pricing_matrix' => 'array',
        'price_seasons' => 'array',
        'amenities' => 'array',
        'services' => 'array',
        'legacy_attributes' => 'array',
        'sort_order' => 'integer',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function gallery(): BelongsTo
    {
        return $this->belongsTo(Gallery::class);
    }

    /**
     * The apartment's images in their order (library media, like a tour's gallery).
     */
    public function galleryItems(): HasMany
    {
        return $this->hasMany(ApartmentGalleryItem::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Apartments shown on the public site: active and published.
     *
     * @param  Builder<Apartment>  $query
     */
    public function scopePubliclyVisible(Builder $query): void
    {
        $query->where('is_active', true)->where('status', self::STATUS_PUBLISHED);
    }

    public function pagePath(): string
    {
        return '/apartman/'.$this->slug;
    }
}
