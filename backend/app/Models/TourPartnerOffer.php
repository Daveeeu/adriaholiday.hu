<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class TourPartnerOffer extends Model
{
    /** @use HasFactory<\Database\Factories\TourPartnerOfferFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'name',
        'partner_name',
        'partner_email',
        'inquiry_date',
        'status',
        'note',
        'active',
    ];

    protected $casts = [
        'inquiry_date' => 'date',
        'active' => 'boolean',
    ];
}
