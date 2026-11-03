<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Database\Factories\CustomerFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * A customer of the agency: contact details, the referral code the legacy
 * site gave them and the coupon value they registered with. Customers have
 * no login; their bookings are the ones made with their e-mail address.
 */
class Customer extends Model
{
    /** @use HasFactory<CustomerFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'email',
        'name',
        'phone',
        'postal_code',
        'city',
        'address',
        'referral_code',
        'registration_coupon_value',
        'note',
        'registered_at',
        'first_login_at',
    ];

    protected $casts = [
        'registration_coupon_value' => 'integer',
        'registered_at' => 'datetime',
        'first_login_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saving(function (Customer $customer): void {
            $customer->email = mb_strtolower(trim($customer->email));
        });
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'email', 'email');
    }
}
