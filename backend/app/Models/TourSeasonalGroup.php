<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TourSeasonalGroup extends Model
{
    /** @use HasFactory<\Database\Factories\TourSeasonalGroupFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'active',
        'menu_type',
        'name',
        'seo_name',
        'seo_auto_generate',
        'box_text',
        'has_offers',
    ];

    protected $casts = [
        'active' => 'boolean',
        'seo_auto_generate' => 'boolean',
        'has_offers' => 'boolean',
    ];

    public function tours(): HasMany
    {
        return $this->hasMany(Tour::class, 'seasonal_group_id', 'seo_name');
    }
}
