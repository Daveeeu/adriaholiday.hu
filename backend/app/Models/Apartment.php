<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Concerns\LogsModelActivity;

class Apartment extends Model
{
    /** @use HasFactory<\Database\Factories\ApartmentFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'region_id',
        'location_id',
        'gallery_id',
        'type',
        'name',
        'slug',
        'code',
        'seo_name',
        'seo_auto_generate',
        'is_active',
        'featured',
        'is_accommodation',
        'stars',
        'bedrooms',
        'bathrooms',
        'max_guests',
        'size_m2',
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
        'status',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'featured' => 'boolean',
        'is_accommodation' => 'boolean',
        'seo_auto_generate' => 'boolean',
        'stars' => 'integer',
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'max_guests' => 'integer',
        'size_m2' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'pricing_matrix' => 'array',
        'price_seasons' => 'array',
        'amenities' => 'array',
        'services' => 'array',
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
}
