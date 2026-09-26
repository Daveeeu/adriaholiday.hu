<?php

namespace Database\Seeders;

use App\Models\BookingFormField;
use Illuminate\Database\Seeder;

class BookingFormFieldSeeder extends Seeder
{
    public function run(): void
    {
        $fields = [
            ['key' => 'contact_name', 'label' => 'Kapcsolattartó neve', 'field_type' => 'text', 'input_group' => 'contact', 'sort_order' => 1],
            ['key' => 'contact_email', 'label' => 'E-mail cím', 'field_type' => 'email', 'input_group' => 'contact', 'sort_order' => 2],
            ['key' => 'contact_phone', 'label' => 'Telefonszám', 'field_type' => 'tel', 'input_group' => 'contact', 'sort_order' => 3],
            ['key' => 'contact_city', 'label' => 'Város', 'field_type' => 'text', 'input_group' => 'contact', 'sort_order' => 4],
            ['key' => 'passenger_name', 'label' => 'Utas neve', 'field_type' => 'text', 'input_group' => 'passenger', 'sort_order' => 6],
            ['key' => 'passenger_birth_date', 'label' => 'Születési dátum', 'field_type' => 'date', 'input_group' => 'passenger', 'sort_order' => 7],
            ['key' => 'passenger_nationality', 'label' => 'Állampolgárság', 'field_type' => 'text', 'input_group' => 'passenger', 'sort_order' => 8],
            ['key' => 'document_type', 'label' => 'Okmány típusa', 'field_type' => 'select', 'input_group' => 'passenger', 'sort_order' => 9, 'options' => ['Személyi igazolvány', 'Útlevél']],
            ['key' => 'document_number', 'label' => 'Okmányszám', 'field_type' => 'text', 'input_group' => 'passenger', 'sort_order' => 10],
            ['key' => 'document_expiry', 'label' => 'Okmány lejárata', 'field_type' => 'date', 'input_group' => 'passenger', 'sort_order' => 11],
            ['key' => 'contact_postal_code', 'label' => 'Irányítószám', 'field_type' => 'text', 'input_group' => 'contact', 'sort_order' => 12],
            ['key' => 'contact_address', 'label' => 'Lakcím (utca, házszám)', 'field_type' => 'text', 'input_group' => 'contact', 'sort_order' => 13],
            ['key' => 'passenger_birth_place', 'label' => 'Születési hely', 'field_type' => 'text', 'input_group' => 'passenger', 'sort_order' => 14],
            ['key' => 'passenger_address', 'label' => 'Lakcím', 'field_type' => 'text', 'input_group' => 'passenger', 'sort_order' => 15],
            ['key' => 'extra_single_room', 'label' => 'Egyágyas felár', 'field_type' => 'checkbox', 'input_group' => 'extra', 'sort_order' => 16, 'description' => 'Külön szoba igénylése.', 'price_label' => '+122.000 Ft'],
            ['key' => 'extra_cancellation_insurance', 'label' => 'Útlemondási biztosítás', 'field_type' => 'checkbox', 'input_group' => 'extra', 'sort_order' => 17, 'description' => 'Biztosítás lemondás esetére.', 'price_label' => '+ díj alapján'],
            ['key' => 'extra_payment_method', 'label' => 'Fizetési mód', 'field_type' => 'radio', 'input_group' => 'extra', 'sort_order' => 18, 'options' => ['Banki befizetés', 'Átutalás']],
            ['key' => 'note', 'label' => 'Megjegyzés', 'field_type' => 'textarea', 'input_group' => 'extra', 'sort_order' => 19],
        ];

        foreach ($fields as $field) {
            BookingFormField::query()->firstOrCreate(
                ['key' => $field['key']],
                [
                    'label' => $field['label'],
                    'description' => $field['description'] ?? null,
                    'price_label' => $field['price_label'] ?? null,
                    'field_type' => $field['field_type'],
                    'input_group' => $field['input_group'],
                    'sort_order' => $field['sort_order'],
                    'options' => $field['options'] ?? null,
                ],
            );
        }
    }
}
