<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class BookingFormTemplateField extends Pivot
{
    public $incrementing = true;

    protected $table = 'booking_form_template_fields';

    protected $fillable = [
        'booking_form_template_id',
        'booking_form_field_id',
        'visibility',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function template(): BelongsTo
    {
        return $this->belongsTo(BookingFormTemplate::class, 'booking_form_template_id');
    }

    public function field(): BelongsTo
    {
        return $this->belongsTo(BookingFormField::class, 'booking_form_field_id');
    }
}
