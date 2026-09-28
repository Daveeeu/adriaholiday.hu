<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
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
}
