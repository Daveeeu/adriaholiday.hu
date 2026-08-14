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
        'starts_at',
        'expires_at',
        'usage_conditions',
        'used',
        'max_uses',
        'used_count',
    ];

    protected $casts = [
        'active' => 'boolean',
        'value' => 'decimal:2',
        'starts_at' => 'date',
        'expires_at' => 'date',
        'used' => 'boolean',
        'max_uses' => 'integer',
        'used_count' => 'integer',
    ];

    /**
     * Whether the coupon can currently be redeemed: active, within its
     * validity window, and under its usage limit (if one is set).
     */
    public function isUsable(): bool
    {
        if (! $this->active || $this->used) {
            return false;
        }

        if ($this->starts_at && $this->starts_at->isFuture()) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return false;
        }

        return true;
    }
}
