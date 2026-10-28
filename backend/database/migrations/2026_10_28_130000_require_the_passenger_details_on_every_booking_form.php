<?php

use App\Support\Booking\DefaultBookingForm;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Every booking form asks each passenger's name, birth date, address and
 * travel document number, which the office needs for the contract; the
 * document number field is named as the office calls it.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('booking_form_fields')->where('key', 'document_number')->update(['label' => 'Útiokmány száma']);

        $fields = DB::table('booking_form_fields')
            ->whereIn('key', DefaultBookingForm::REQUIRED_PASSENGER_FIELDS)
            ->get(['id', 'sort_order']);
        $now = now();

        foreach (DB::table('booking_form_templates')->pluck('id') as $templateId) {
            foreach ($fields as $field) {
                $updated = DB::table('booking_form_template_fields')
                    ->where('booking_form_template_id', $templateId)
                    ->where('booking_form_field_id', $field->id)
                    ->update(['visibility' => 'required', 'updated_at' => $now]);

                if ($updated === 0) {
                    DB::table('booking_form_template_fields')->insert([
                        'booking_form_template_id' => $templateId,
                        'booking_form_field_id' => $field->id,
                        'visibility' => 'required',
                        'sort_order' => $field->sort_order,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        // Content update only.
    }
};
