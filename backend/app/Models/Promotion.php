<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Database\Factories\PromotionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Promotion extends Model
{
    /** @use HasFactory<PromotionFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'title',
        'message',
        'code',
        'is_active',
        'starts_at',
        'expires_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'starts_at' => 'date',
        'expires_at' => 'date',
    ];
}
