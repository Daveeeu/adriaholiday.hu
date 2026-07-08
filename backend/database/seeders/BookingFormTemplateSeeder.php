<?php

namespace Database\Seeders;

use App\Models\BookingFormField;
use App\Models\BookingFormTemplate;
use Illuminate\Database\Seeder;

class BookingFormTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedTemplate('Buszos út', 'buszos-ut', [
            'contact_name' => 'required',
            'contact_email' => 'required',
            'contact_phone' => 'required',
            'contact_city' => 'optional',
            'note' => 'optional',
            'passenger_name' => 'required',
            'passenger_birth_date' => 'optional',
            'passenger_nationality' => 'optional',
            'document_type' => 'hidden',
            'document_number' => 'hidden',
            'document_expiry' => 'hidden',
        ]);

        $this->seedTemplate('Repülős út', 'repulos-ut', [
            'contact_name' => 'required',
            'contact_email' => 'required',
            'contact_phone' => 'required',
            'contact_city' => 'hidden',
            'note' => 'optional',
            'passenger_name' => 'required',
            'passenger_birth_date' => 'required',
            'passenger_nationality' => 'required',
            'document_type' => 'required',
            'document_number' => 'required',
            'document_expiry' => 'required',
        ]);
    }

    /**
     * @param  array<string, string>  $visibilityByFieldKey
     */
    private function seedTemplate(string $name, string $slug, array $visibilityByFieldKey): void
    {
        $template = BookingFormTemplate::query()->updateOrCreate(
            ['slug' => $slug],
            ['name' => $name, 'active' => true],
        );

        $template->templateFields()->delete();

        $fields = BookingFormField::query()->orderBy('sort_order')->get();

        foreach ($fields as $index => $field) {
            $template->templateFields()->create([
                'booking_form_field_id' => $field->id,
                'visibility' => $visibilityByFieldKey[$field->key] ?? 'hidden',
                'sort_order' => $index + 1,
            ]);
        }
    }
}
