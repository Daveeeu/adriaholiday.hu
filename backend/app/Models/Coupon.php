<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Carbon\CarbonImmutable;
use Database\Factories\CouponFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * A code that takes a fixed amount (value) or a percentage of the base price
 * (percent) off a tour booking. One bound to a tour date (a last seats
 * coupon) is good for that date only, on any tour; any other only on tours
 * that accept coupons.
 */
class Coupon extends Model
{
    /** @use HasFactory<CouponFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'active',
        'name',
        'email',
        'code',
        'value',
        'percent',
        'tour_date_id',
        'expires_at',
        'used',
    ];

    protected $casts = [
        'active' => 'boolean',
        'value' => 'decimal:2',
        'percent' => 'decimal:2',
        'expires_at' => 'datetime',
        'used' => 'boolean',
    ];

    /** A fresh code that no coupon uses yet, e.g. "HIR-K3P9QZ". */
    public static function uniqueCode(string $prefix): string
    {
        do {
            $code = $prefix.'-'.strtoupper(Str::random(6));
        } while (self::query()->withTrashed()->where('code', $code)->exists());

        return $code;
    }

    /** @return BelongsTo<TourDate, $this> */
    public function tourDate(): BelongsTo
    {
        return $this->belongsTo(TourDate::class);
    }

    /** Active, unused and not expired yet. */
    public function scopeRedeemable(Builder $query): void
    {
        $query->where('active', true)
            ->where('used', false)
            ->where(fn (Builder $query) => $query->whereNull('expires_at')->orWhere('expires_at', '>=', now()));
    }

    /**
     * An expiry given as a day (as the admin form sends it) holds all that
     * day; a moment is kept as it is.
     */
    protected function expiresAt(): Attribute
    {
        return Attribute::set(fn (mixed $value): mixed => is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}$/', $value) === 1
            ? CarbonImmutable::parse($value)->setTime(23, 59, 59)
            : $value);
    }
}
