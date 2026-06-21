<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    /** @use HasFactory<\Database\Factories\CouponFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'active',
        'name',
        'email',
        'code',
        'value',
        'expires_at',
        'used',
    ];

    protected $casts = [
        'active' => 'boolean',
        'value' => 'decimal:2',
        'expires_at' => 'date',
        'used' => 'boolean',
    ];
}
