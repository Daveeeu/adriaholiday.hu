<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartnerBanner extends Model
{
    /** @use HasFactory<\Database\Factories\PartnerBannerFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'name',
        'url',
        'image',
        'width',
        'height',
        'embed_code',
        'status',
    ];

    protected $casts = [
        'width' => 'integer',
        'height' => 'integer',
    ];
}
