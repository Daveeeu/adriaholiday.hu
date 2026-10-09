<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use App\Support\TourSearchIndex;
use Database\Factories\TourReferenceOptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TourReferenceOption extends Model
{
    /** @use HasFactory<TourReferenceOptionFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'type',
        'code',
        'name',
        'active',
        'sort_order',
    ];

    protected $casts = [
        'active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected static function booted(): void
    {
        // Country names are searchable on the tours (see TourSearchIndex).
        static::saved(function (TourReferenceOption $option): void {
            if ($option->type === 'country' && $option->wasChanged('name')) {
                TourSearchIndex::refresh(Tour::withTrashed()->whereJsonContains('country_ids', $option->code));
            }
        });
    }
}
