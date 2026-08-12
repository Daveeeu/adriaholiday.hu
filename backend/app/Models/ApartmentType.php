<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Database\Factories\ApartmentTypeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ApartmentType extends Model
{
    /** @use HasFactory<ApartmentTypeFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    /**
     * Slugs reserved by the admin router's static /apartments/* sub-routes
     * (regions, places, types, ...) and the /apartments/:typeSlug/{new,detail}
     * segments — a type slug matching one of these would never be reachable.
     */
    public const RESERVED_SLUGS = [
        'regions',
        'places',
        'types',
        'services',
        'actions',
        'custom-intervals',
        'new',
        'detail',
    ];

    protected $fillable = [
        'slug',
        'name',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
