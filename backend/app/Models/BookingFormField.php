<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BookingFormField extends Model
{
    use LogsModelActivity;

    public const FIELD_TYPES = ['text', 'textarea', 'email', 'tel', 'date', 'number', 'select'];

    public const INPUT_GROUPS = ['contact', 'passenger'];

    public const VISIBILITIES = ['required', 'optional', 'hidden'];

    /**
     * Fields mapped onto dedicated booking columns by the public booking
     * flow; their key, type and group must stay stable.
     */
    public const SYSTEM_KEYS = ['contact_name', 'contact_email', 'contact_phone', 'contact_city', 'note'];

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

    public function isSystem(): bool
    {
        return in_array($this->key, self::SYSTEM_KEYS, true);
    }

    public function templates(): BelongsToMany
    {
        return $this->belongsToMany(BookingFormTemplate::class, 'booking_form_template_fields')
            ->using(BookingFormTemplateField::class)
            ->withPivot(['id', 'visibility', 'sort_order'])
            ->withTimestamps();
    }

    public function templateFields(): HasMany
    {
        return $this->hasMany(BookingFormTemplateField::class);
    }
}
