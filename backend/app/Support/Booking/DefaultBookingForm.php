<?php

namespace App\Support\Booking;

/**
 * The booking form used for tours without their own template.
 *
 * Normally this is the template admins mark as default; the field set here
 * describes that template's seeded shape, and is also the last-resort form
 * when no default template exists, so public bookings always keep working.
 */
final class DefaultBookingForm
{
    public const TEMPLATE_NAME = 'Alapértelmezett';

    public const TEMPLATE_SLUG = 'alapertelmezett';

    /**
     * @var array<int, array{key: string, label: string, fieldType: string, inputGroup: string, options: array<int, string>|null, description: string|null, priceLabel: string|null, visibility: string}>
     */
    public const FIELDS = [
        ['key' => 'contact_name', 'label' => 'Teljes név', 'fieldType' => 'text', 'inputGroup' => 'contact', 'options' => null, 'description' => null, 'priceLabel' => null, 'visibility' => 'required'],
        ['key' => 'contact_email', 'label' => 'E-mail', 'fieldType' => 'email', 'inputGroup' => 'contact', 'options' => null, 'description' => null, 'priceLabel' => null, 'visibility' => 'required'],
        ['key' => 'contact_phone', 'label' => 'Telefonszám', 'fieldType' => 'tel', 'inputGroup' => 'contact', 'options' => null, 'description' => null, 'priceLabel' => null, 'visibility' => 'required'],
        ['key' => 'contact_city', 'label' => 'Város', 'fieldType' => 'text', 'inputGroup' => 'contact', 'options' => null, 'description' => null, 'priceLabel' => null, 'visibility' => 'optional'],
        ['key' => 'passenger_name', 'label' => 'Utas neve', 'fieldType' => 'text', 'inputGroup' => 'passenger', 'options' => null, 'description' => null, 'priceLabel' => null, 'visibility' => 'required'],
        ['key' => 'passenger_birth_date', 'label' => 'Születési dátum', 'fieldType' => 'date', 'inputGroup' => 'passenger', 'options' => null, 'description' => null, 'priceLabel' => null, 'visibility' => 'required'],
        ['key' => 'passenger_nationality', 'label' => 'Állampolgárság', 'fieldType' => 'text', 'inputGroup' => 'passenger', 'options' => null, 'description' => null, 'priceLabel' => null, 'visibility' => 'optional'],
        ['key' => 'note', 'label' => 'Megjegyzés', 'fieldType' => 'textarea', 'inputGroup' => 'extra', 'options' => null, 'description' => null, 'priceLabel' => null, 'visibility' => 'optional'],
    ];

    /**
     * Visibility of catalog fields in the seeded default template; fields
     * not listed are hidden.
     *
     * @var array<string, string>
     */
    public const TEMPLATE_VISIBILITY = [
        'contact_name' => 'required',
        'contact_email' => 'required',
        'contact_phone' => 'required',
        'contact_city' => 'optional',
        'passenger_name' => 'required',
        'passenger_birth_date' => 'required',
        'passenger_nationality' => 'optional',
        'extra_single_room' => 'optional',
        'extra_cancellation_insurance' => 'optional',
        'extra_payment_method' => 'optional',
        'note' => 'optional',
    ];
}
