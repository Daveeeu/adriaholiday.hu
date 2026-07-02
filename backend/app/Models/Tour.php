<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Tour extends Model implements HasMedia
{
    /** @use HasFactory<\Database\Factories\TourFactory> */
    use HasFactory, InteractsWithMedia, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'sort_order',
        'active',
        'featured',
        'recommended',
        'partner_offer',
        'image_offer',
        'xml_enabled',
        'slider_image_enabled',
        'slider_text_enabled',
        'name',
        'seo_name',
        'seo_auto_generate',
        'action1',
        'action2',
        'list_description',
        'short_description',
        'program_pdf_path',
        'program_pdf_file',
        'slider_image',
        'program_before',
        'program',
        'inclusions',
        'payment_program',
        'prices',
        'discounts',
        'notes',
        'gallery_title',
        'gallery_subtitle',
        'region_id',
        'homepage_offer_id',
        'group_id',
        'seasonal_group_id',
        'fit_id',
        'program_type_id',
        'travel_mode_id',
        'difficulty_id',
        'country_ids',
        'tag_ids',
        'category_ids',
        'price',
        'price_box_price',
        'price_box_displayed_price',
        'price_box_currency',
        'price_box_price_suffix',
        'price_box_discount_badge',
        'price_box_discount_text',
        'price_box_urgency_text',
        'price_box_rating_text',
        'price_box_min_participants',
        'price_box_max_participants',
        'price_box_available_seats',
        'price_box_capacity',
        'price_box_cta_primary_label',
        'price_box_cta_secondary_label',
        'displayed_price',
        'slider_text',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'active' => 'boolean',
        'featured' => 'boolean',
        'recommended' => 'boolean',
        'partner_offer' => 'boolean',
        'image_offer' => 'boolean',
        'xml_enabled' => 'boolean',
        'slider_image_enabled' => 'boolean',
        'slider_text_enabled' => 'boolean',
        'seo_auto_generate' => 'boolean',
        'price' => 'decimal:2',
        'price_box_price' => 'decimal:2',
        'price_box_min_participants' => 'integer',
        'price_box_max_participants' => 'integer',
        'price_box_available_seats' => 'integer',
        'price_box_capacity' => 'integer',
        'country_ids' => 'array',
        'tag_ids' => 'array',
        'category_ids' => 'array',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function homepageOffer(): BelongsTo
    {
        return $this->belongsTo(HomepageOffer::class);
    }

    public function dates(): HasMany
    {
        return $this->hasMany(TourDate::class);
    }

    public function partnerBonuses(): HasMany
    {
        return $this->hasMany(TourPartnerBonus::class);
    }

    public function programDays(): HasMany
    {
        return $this->hasMany(TourProgramDay::class)->orderBy('sort_order');
    }

    public function galleryItems(): HasMany
    {
        return $this->hasMany(TourGalleryItem::class)->orderBy('sort_order');
    }

    public function priceItems(): HasMany
    {
        return $this->hasMany(TourPriceItem::class)->orderBy('sort_order');
    }

    public function departurePlaces(): BelongsToMany
    {
        return $this->belongsToMany(TourDeparturePlace::class, 'tour_departure_place_tour');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('slider')->useDisk(config('media-library.disk_name'));
        $this->addMediaCollection('pdf')->singleFile()->useDisk(config('media-library.disk_name'));
    }
}
