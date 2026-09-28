<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Database\Factories\BusFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bus extends Model
{
    /** @use HasFactory<BusFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'active',
        'vehicle_code',
        'sort_order',
    ];

    protected $casts = [
        'active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function translations(): HasMany
    {
        return $this->hasMany(BusTranslation::class);
    }
}
