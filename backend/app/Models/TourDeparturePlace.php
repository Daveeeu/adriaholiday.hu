<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TourDeparturePlace extends Model
{
    /** @use HasFactory<\Database\Factories\TourDeparturePlaceFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'active',
        'name',
        'city',
        'fee',
    ];

    protected $casts = [
        'active' => 'boolean',
        'fee' => 'decimal:2',
    ];

    public function tours(): BelongsToMany
    {
        return $this->belongsToMany(Tour::class, 'tour_departure_place_tour');
    }
}
