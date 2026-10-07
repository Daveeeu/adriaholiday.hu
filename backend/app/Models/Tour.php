<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Database\Factories\TourFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Tour extends Model implements HasMedia
{
    /** @use HasFactory<TourFactory> */
    use HasFactory, InteractsWithMedia, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'sort_order',
        'active',
        'featured',
        'recommended',
        'partner_offer',
        'image_offer',
        'xml_enabled',
        'couponable',
        'slider_image_enabled',
        'slider_text_enabled',
        'name',
        'subtitle',
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
        'teaser',
        'tickets',
        'optional_programs',
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
        'booking_form_template_id',
        'catering',
        'accommodation',
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
        'couponable' => 'boolean',
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

    public function bookingFormTemplate(): BelongsTo
    {
        return $this->belongsTo(BookingFormTemplate::class);
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
        return $this->belongsToMany(TourDeparturePlace::class, 'tour_departure_place_tour')->withPivot('fee');
    }

    /**
     * The image shown on the tour's page header and listing cards: the
     * dedicated slider image, else the first active gallery image (imported
     * and admin-created tours usually only have a gallery).
     */
    public function mainImage(): ?Media
    {
        return $this->getFirstMedia('slider')
            ?? $this->galleryItems->where('active', true)->whereNotNull('media')->sortBy('sort_order')->first()?->media;
    }

    /**
     * Images a program day without its own image falls back to: the tour's
     * active gallery images, leaving out the main image (already shown in
     * the page header) unless it is the only one.
     *
     * @return list<string>
     */
    public function programDayFallbackImageUrls(): array
    {
        $mainImageId = $this->mainImage()?->id;
        $urls = $this->galleryItems
            ->where('active', true)
            ->whereNotNull('media')
            ->sortBy('sort_order')
            ->map(fn (TourGalleryItem $item): array => [$item->media->id, $item->media->getUrl()]);

        $withoutMainImage = $urls->reject(fn (array $image): bool => $image[0] === $mainImageId);

        return ($withoutMainImage->isNotEmpty() ? $withoutMainImage : $urls)
            ->pluck(1)
            ->values()
            ->all();
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('slider')->useDisk(config('media-library.disk_name'));
        $this->addMediaCollection('pdf')->singleFile()->useDisk(config('media-library.disk_name'));
    }
}
