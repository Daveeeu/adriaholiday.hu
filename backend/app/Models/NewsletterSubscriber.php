<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NewsletterSubscriber extends Model
{
    protected $fillable = [
        'email',
        'coupon_id',
        'mailchimp_synced_at',
    ];

    protected function casts(): array
    {
        return [
            'mailchimp_synced_at' => 'datetime',
        ];
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function scopeNotSyncedToMailchimp(Builder $query): Builder
    {
        return $query->whereNull('mailchimp_synced_at');
    }
}
