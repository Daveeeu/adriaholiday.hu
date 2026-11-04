<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BookingFormField extends Model
{
    use LogsModelActivity;

    public const FIELD_TYPES = ['text', 'textarea', 'email', 'tel', 'date', 'number', 'select', 'radio', 'checkbox'];

    /**
     * Field types whose value must be one of the field's options.
     */
    public const OPTION_FIELD_TYPES = ['select', 'radio'];

    /**
     * Stored value of a ticked checkbox; an unticked checkbox stores nothing.
     */
    public const CHECKBOX_CHECKED_VALUE = 'Igen';

    /**
     * contact: asked once, on the contact step.
     * passenger: asked for every passenger.
     * extra: asked once, on the final step (extra options, note, consents).
     */
    public const INPUT_GROUPS = ['contact', 'passenger', 'extra'];

    public const PASSENGER_GROUP = 'passenger';

    public const EXTRA_GROUP = 'extra';

    /**
     * required: must be filled in to book.
     * deferred: needed, but the customer may book without it; we then e-mail
     * them a link to give it later (see BookingDetailsRequestService).
     * optional: may stay empty.
     * hidden: not asked.
     */
    public const VISIBILITIES = ['required', self::VISIBILITY_DEFERRED, 'optional', 'hidden'];

    public const VISIBILITY_DEFERRED = 'deferred';

    /**
     * Contact fields copied onto the booking's own columns, so the booking
     * lists and e-mails can use them directly.
     */
    public const CONTACT_COLUMNS = [
        'contact_name' => 'customer_name',
        'contact_email' => 'email',
        'contact_phone' => 'phone',
        'contact_city' => 'city',
        'contact_address' => 'address',
    ];

    /**
     * Fields mapped onto dedicated booking columns by the public booking
     * flow; their key, type and group must stay stable.
     */
    public const SYSTEM_KEYS = ['contact_name', 'contact_email', 'contact_phone', 'contact_city', 'note'];

    protected $fillable = [
        'key',
        'label',
        'description',
        'price_label',
        'field_type',
        'input_group',
        'sort_order',
        'options',
        'disabled_options',
    ];

    protected $casts = [
        'sort_order' => 'integer',
        'options' => 'array',
        'disabled_options' => 'array',
    ];

    public static function usesOptions(string $fieldType): bool
    {
        return in_array($fieldType, self::OPTION_FIELD_TYPES, true);
    }

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
