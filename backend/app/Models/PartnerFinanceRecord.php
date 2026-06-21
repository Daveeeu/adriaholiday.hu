<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartnerFinanceRecord extends Model
{
    /** @use HasFactory<\Database\Factories\PartnerFinanceRecordFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'partner_name',
        'date',
        'amount',
        'type',
        'status',
        'balance',
        'note',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'balance' => 'decimal:2',
    ];
}
