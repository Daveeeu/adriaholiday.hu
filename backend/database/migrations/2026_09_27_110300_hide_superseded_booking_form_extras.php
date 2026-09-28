<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The single room supplement and the cancellation insurance are now priced
 * booking options (tour date extras and booking insurances). Their older
 * free-text booking form checkboxes, which showed a fixed placeholder price,
 * would duplicate them on the public form, so they are hidden in every
 * template; admins can still show them again.
 */
return new class extends Migration
{
    private const SUPERSEDED_FIELDS = ['extra_single_room', 'extra_cancellation_insurance'];

    public function up(): void
    {
        $this->setVisibility('hidden');
    }

    public function down(): void
    {
        $this->setVisibility('optional');
    }

    private function setVisibility(string $visibility): void
    {
        $fieldIds = DB::table('booking_form_fields')->whereIn('key', self::SUPERSEDED_FIELDS)->pluck('id');

        DB::table('booking_form_template_fields')
            ->whereIn('booking_form_field_id', $fieldIds)
            ->update(['visibility' => $visibility, 'updated_at' => now()]);
    }
};
