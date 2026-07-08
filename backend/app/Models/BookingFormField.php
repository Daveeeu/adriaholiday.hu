<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class BookingFormField extends Model
{
    protected $fillable = [
        'key',
        'label',
        'field_type',
        'input_group',
        'sort_order',
        'options',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'options' => 'array',
    ];

    public function templates(): BelongsToMany
    {
        return $this->belongsToMany(BookingFormTemplate::class, 'booking_form_template_fields')
            ->using(BookingFormTemplateField::class)
            ->withPivot(['id', 'visibility', 'sort_order'])
            ->withTimestamps();
    }
}
