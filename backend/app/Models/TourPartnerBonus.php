<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TourPartnerBonus extends Model
{
    /** @use HasFactory<\Database\Factories\TourPartnerBonusFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'tour_id',
        'sort_order',
        'label',
        'value',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }
}
