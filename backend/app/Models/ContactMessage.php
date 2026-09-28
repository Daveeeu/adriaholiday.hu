<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Database\Factories\ContactMessageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactMessage extends Model
{
    /** @use HasFactory<ContactMessageFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'message',
        'status',
    ];
}
