<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BusTranslation extends Model
{
    /** @use HasFactory<\Database\Factories\BusTranslationFactory> */
    use HasFactory;

    protected $fillable = [
        'bus_id',
        'locale',
        'name',
        'seo_name',
        'seo_auto_generate',
    ];

    protected $casts = [
        'seo_auto_generate' => 'boolean',
    ];

    public function bus(): BelongsTo
    {
        return $this->belongsTo(Bus::class);
    }
}
