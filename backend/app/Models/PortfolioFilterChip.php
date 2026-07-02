<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PortfolioFilterChip extends Model
{
    use HasFactory;

    protected $fillable = [
        'scope_type',
        'scope_value',
        'label',
        'slug',
        'icon',
        'filter_type',
        'filter_value',
        'filter_config',
        'sort_order',
        'active',
        'hide_when_zero',
    ];

    protected $casts = [
        'filter_config' => 'array',
        'sort_order' => 'integer',
        'active' => 'boolean',
        'hide_when_zero' => 'boolean',
    ];
}
