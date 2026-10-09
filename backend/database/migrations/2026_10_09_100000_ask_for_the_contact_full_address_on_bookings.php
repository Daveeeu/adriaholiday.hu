<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Bookings ask the contact person for their full address (postal code, city,
 * street), as the legacy site did, instead of the city alone. Every booking
 * form template shows the three fields, required and in that order, in place
 * of the city field.
 */
return new class extends Migration
{
    private const ADDRESS_KEYS = ['contact_postal_code', 'contact_city', 'contact_address'];

    public function up(): void
    {
        $fieldIds = DB::table('booking_form_fields')->whereIn('key', self::ADDRESS_KEYS)->pluck('id', 'key')->map(fn ($id) => (int) $id);

        if (! $fieldIds->has(['contact_postal_code', 'contact_address'])) {
            return;
        }

        DB::table('booking_form_fields')->where('key', 'contact_address')->update([
            'label' => 'Utca, házszám',
            'updated_at' => now(),
        ]);

        if (! $fieldIds->has('contact_city')) {
            // A fresh install: BookingFormFieldSeeder adds the city and the
            // rest of the catalog around these positions.
            DB::table('booking_form_fields')->where('key', 'contact_postal_code')->update(['sort_order' => 4]);
            DB::table('booking_form_fields')->where('key', 'contact_address')->update(['sort_order' => 6]);

            return;
        }

        // The catalog order is the order of templates created from now on.
        $catalogOrder = $this->placeAroundCity(
            DB::table('booking_form_fields')->orderBy('sort_order')->orderBy('id')->pluck('id')->map(fn ($id) => (int) $id)->all(),
            $fieldIds->all(),
        );

        foreach ($catalogOrder as $index => $fieldId) {
            DB::table('booking_form_fields')->where('id', $fieldId)->update(['sort_order' => $index + 1]);
        }

        DB::table('booking_form_templates')->pluck('id')->each(
            fn ($templateId) => $this->showAddressFields((int) $templateId, $fieldIds->all()),
        );
    }

    public function down(): void
    {
        // Content update only.
    }

    /**
     * @param  array<string, int>  $fieldIds  field key => field id
     */
    private function showAddressFields(int $templateId, array $fieldIds): void
    {
        $now = now();

        foreach ($fieldIds as $fieldId) {
            $exists = DB::table('booking_form_template_fields')
                ->where('booking_form_template_id', $templateId)
                ->where('booking_form_field_id', $fieldId)
                ->exists();

            if (! $exists) {
                DB::table('booking_form_template_fields')->insert([
                    'booking_form_template_id' => $templateId,
                    'booking_form_field_id' => $fieldId,
                    'visibility' => 'required',
                    'sort_order' => 0,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        DB::table('booking_form_template_fields')
            ->where('booking_form_template_id', $templateId)
            ->whereIn('booking_form_field_id', $fieldIds)
            ->update(['visibility' => 'required', 'updated_at' => $now]);

        $order = $this->placeAroundCity(
            DB::table('booking_form_template_fields')
                ->where('booking_form_template_id', $templateId)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->pluck('booking_form_field_id')
                ->map(fn ($id) => (int) $id)
                ->all(),
            $fieldIds,
        );

        foreach ($order as $index => $fieldId) {
            DB::table('booking_form_template_fields')
                ->where('booking_form_template_id', $templateId)
                ->where('booking_form_field_id', $fieldId)
                ->update(['sort_order' => $index + 1]);
        }
    }

    /**
     * Moves the postal code and street fields next to the city: postal code,
     * city, street, where the city was.
     *
     * @param  array<int, int>  $orderedFieldIds
     * @param  array<string, int>  $fieldIds  field key => field id
     * @return array<int, int>
     */
    private function placeAroundCity(array $orderedFieldIds, array $fieldIds): array
    {
        $order = array_values(array_filter(
            $orderedFieldIds,
            fn (int $fieldId) => ! in_array($fieldId, [$fieldIds['contact_postal_code'], $fieldIds['contact_address']], true),
        ));

        $cityIndex = array_search($fieldIds['contact_city'], $order, true);
        array_splice($order, $cityIndex, 1, [$fieldIds['contact_postal_code'], $fieldIds['contact_city'], $fieldIds['contact_address']]);

        return $order;
    }
};
