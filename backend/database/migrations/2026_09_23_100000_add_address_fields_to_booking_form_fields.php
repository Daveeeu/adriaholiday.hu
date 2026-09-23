<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * @var array<int, array{key: string, label: string, field_type: string, input_group: string, sort_order: int}>
     */
    private const FIELDS = [
        ['key' => 'contact_postal_code', 'label' => 'Irányítószám', 'field_type' => 'text', 'input_group' => 'contact', 'sort_order' => 12],
        ['key' => 'contact_address', 'label' => 'Lakcím (utca, házszám)', 'field_type' => 'text', 'input_group' => 'contact', 'sort_order' => 13],
        ['key' => 'passenger_birth_place', 'label' => 'Születési hely', 'field_type' => 'text', 'input_group' => 'passenger', 'sort_order' => 14],
        ['key' => 'passenger_address', 'label' => 'Lakcím', 'field_type' => 'text', 'input_group' => 'passenger', 'sort_order' => 15],
    ];

    public function up(): void
    {
        $now = now();

        DB::table('booking_form_fields')->insertOrIgnore(
            array_map(fn (array $field): array => $field + ['created_at' => $now, 'updated_at' => $now], self::FIELDS),
        );

        // Select options are now shown to customers as-is, so replace the internal codes with labels.
        DB::table('booking_form_fields')
            ->where('key', 'document_type')
            ->update(['options' => json_encode(['Személyi igazolvány', 'Útlevél'], JSON_UNESCAPED_UNICODE)]);
    }

    public function down(): void
    {
        DB::table('booking_form_fields')
            ->whereIn('key', array_column(self::FIELDS, 'key'))
            ->delete();

        DB::table('booking_form_fields')
            ->where('key', 'document_type')
            ->update(['options' => json_encode(['personal_id', 'passport'])]);
    }
};
