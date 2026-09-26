<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Makes the booking form's final step ("Extra opciók és megjegyzés")
 * configurable: adds the "extra" field group with checkbox/radio fields,
 * turns the previously hard-coded extras into catalog fields, moves the
 * note field into that step, and introduces an admin-selectable default
 * template for tours without their own template.
 */
return new class extends Migration
{
    /**
     * @var array<int, array{key: string, label: string, field_type: string, input_group: string, sort_order: int, description: string|null, price_label: string|null, options: array<int, string>|null}>
     */
    private const EXTRA_FIELDS = [
        ['key' => 'extra_single_room', 'label' => 'Egyágyas felár', 'field_type' => 'checkbox', 'input_group' => 'extra', 'sort_order' => 16, 'description' => 'Külön szoba igénylése.', 'price_label' => '+122.000 Ft', 'options' => null],
        ['key' => 'extra_cancellation_insurance', 'label' => 'Útlemondási biztosítás', 'field_type' => 'checkbox', 'input_group' => 'extra', 'sort_order' => 17, 'description' => 'Biztosítás lemondás esetére.', 'price_label' => '+ díj alapján', 'options' => null],
        ['key' => 'extra_payment_method', 'label' => 'Fizetési mód', 'field_type' => 'radio', 'input_group' => 'extra', 'sort_order' => 18, 'description' => null, 'price_label' => null, 'options' => ['Banki befizetés', 'Átutalás']],
    ];

    /**
     * Mirrors the form previously hard-coded for tours without a template.
     *
     * @var array<string, string>
     */
    private const DEFAULT_TEMPLATE_VISIBILITY = [
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

    private const DEFAULT_TEMPLATE_SLUG = 'alapertelmezett';

    public function up(): void
    {
        Schema::table('booking_form_fields', function (Blueprint $table): void {
            $table->string('description', 500)->nullable()->after('label');
            $table->string('price_label', 100)->nullable()->after('description');
        });

        Schema::table('booking_form_templates', function (Blueprint $table): void {
            $table->boolean('is_default')->default(false)->after('active')->index();
        });

        $now = now();

        DB::table('booking_form_fields')->insertOrIgnore(array_map(
            fn (array $field): array => [
                ...$field,
                'options' => $field['options'] === null ? null : json_encode($field['options'], JSON_UNESCAPED_UNICODE),
                'created_at' => $now,
                'updated_at' => $now,
            ],
            self::EXTRA_FIELDS,
        ));

        DB::table('booking_form_fields')->where('key', 'note')->update(['input_group' => 'extra', 'sort_order' => 19]);

        $this->addExtrasToExistingTemplates();
        $this->createDefaultTemplate();
    }

    public function down(): void
    {
        $defaultTemplateId = DB::table('booking_form_templates')->where('slug', self::DEFAULT_TEMPLATE_SLUG)->value('id');

        if ($defaultTemplateId !== null) {
            DB::table('tours')->where('booking_form_template_id', $defaultTemplateId)->update(['booking_form_template_id' => null]);
            DB::table('booking_form_templates')->where('id', $defaultTemplateId)->delete();
        }

        DB::table('booking_form_fields')->whereIn('key', array_column(self::EXTRA_FIELDS, 'key'))->delete();
        DB::table('booking_form_fields')->where('key', 'note')->update(['input_group' => 'contact', 'sort_order' => 5]);

        Schema::table('booking_form_templates', function (Blueprint $table): void {
            $table->dropIndex(['is_default']);
            $table->dropColumn('is_default');
        });

        Schema::table('booking_form_fields', function (Blueprint $table): void {
            $table->dropColumn(['description', 'price_label']);
        });
    }

    /**
     * Existing templates showed the hard-coded extras, so they keep showing
     * them as optional fields, placed after their current fields; the note
     * moves behind them, closing the final step.
     */
    private function addExtrasToExistingTemplates(): void
    {
        $extraFieldIds = DB::table('booking_form_fields')
            ->whereIn('key', array_column(self::EXTRA_FIELDS, 'key'))
            ->orderBy('sort_order')
            ->pluck('id');
        $noteFieldId = DB::table('booking_form_fields')->where('key', 'note')->value('id');

        $now = now();

        foreach (DB::table('booking_form_templates')->pluck('id') as $templateId) {
            $sortOrder = (int) DB::table('booking_form_template_fields')->where('booking_form_template_id', $templateId)->max('sort_order');

            foreach ($extraFieldIds as $fieldId) {
                DB::table('booking_form_template_fields')->insertOrIgnore([
                    'booking_form_template_id' => $templateId,
                    'booking_form_field_id' => $fieldId,
                    'visibility' => 'optional',
                    'sort_order' => ++$sortOrder,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            DB::table('booking_form_template_fields')
                ->where('booking_form_template_id', $templateId)
                ->where('booking_form_field_id', $noteFieldId)
                ->update(['sort_order' => ++$sortOrder]);
        }
    }

    /**
     * On a fresh database the field catalog is filled by the seeders, which
     * also create the default template, so only existing installs need it here.
     */
    private function createDefaultTemplate(): void
    {
        if (! DB::table('booking_form_fields')->where('key', 'contact_name')->exists()
            || DB::table('booking_form_templates')->where('slug', self::DEFAULT_TEMPLATE_SLUG)->exists()) {
            return;
        }

        $now = now();

        $templateId = DB::table('booking_form_templates')->insertGetId([
            'name' => 'Alapértelmezett',
            'slug' => self::DEFAULT_TEMPLATE_SLUG,
            'description' => 'Azoknál az utazásoknál használjuk, amelyekhez nincs külön sablon kiválasztva.',
            'active' => true,
            'is_default' => ! DB::table('booking_form_templates')->where('is_default', true)->exists(),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $fieldIdsByKey = DB::table('booking_form_fields')
            ->whereIn('key', array_keys(self::DEFAULT_TEMPLATE_VISIBILITY))
            ->pluck('id', 'key');

        $sortOrder = 0;

        foreach (self::DEFAULT_TEMPLATE_VISIBILITY as $key => $visibility) {
            if (! isset($fieldIdsByKey[$key])) {
                continue;
            }

            DB::table('booking_form_template_fields')->insert([
                'booking_form_template_id' => $templateId,
                'booking_form_field_id' => $fieldIdsByKey[$key],
                'visibility' => $visibility,
                'sort_order' => ++$sortOrder,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
};
