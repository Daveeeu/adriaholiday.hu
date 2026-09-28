<?php

namespace App\Models;

use Database\Factories\HomepageOfferTranslationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HomepageOfferTranslation extends Model
{
    /** @use HasFactory<HomepageOfferTranslationFactory> */
    use HasFactory;

    protected $fillable = [
        'homepage_offer_id',
        'locale',
        'name',
        'seo_name',
        'short_description',
    ];

    public function homepageOffer(): BelongsTo
    {
        return $this->belongsTo(HomepageOffer::class);
    }
}
