<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TourRegionGroup extends Model
{
    /** @use HasFactory<\Database\Factories\TourRegionGroupFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'active',
        'featured_on_homepage',
        'type',
        'name',
        'seo_name',
        'seo_auto_generate',
        'gallery_id',
        'description',
        'list_below_text',
        'travel_conditions_link',
    ];

    protected $casts = [
        'active' => 'boolean',
        'featured_on_homepage' => 'boolean',
        'seo_auto_generate' => 'boolean',
    ];

    public function gallery(): BelongsTo
    {
        return $this->belongsTo(Gallery::class);
    }

    public function tours(): HasMany
    {
        return $this->hasMany(Tour::class, 'group_id', 'seo_name');
    }
}
