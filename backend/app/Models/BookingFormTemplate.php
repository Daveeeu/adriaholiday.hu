<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BookingFormTemplate extends Model
{
    use LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function templateFields(): HasMany
    {
        return $this->hasMany(BookingFormTemplateField::class)->orderBy('sort_order');
    }

    public function tours(): HasMany
    {
        return $this->hasMany(Tour::class);
    }
}
