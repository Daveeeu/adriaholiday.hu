<?php

namespace App\Services\Booking;

use App\Models\BookingFormTemplate;
use Illuminate\Support\Facades\DB;

/**
 * Creates and updates booking form templates together with their field
 * settings, and keeps at most one template marked as the default form for
 * tours without their own template.
 */
class BookingFormTemplateService
{
    /**
     * @param  array{name: string, slug: string, description?: string|null, active?: bool, is_default?: bool, fields?: array<int, array{field_id: int, visibility: string, sort_order?: int|null}>}  $data
     */
    public function create(array $data): BookingFormTemplate
    {
        return DB::transaction(function () use ($data): BookingFormTemplate {
            $template = BookingFormTemplate::create($this->attributes($data));

            $this->syncFields($template, $data['fields'] ?? []);
            $this->ensureSingleDefault($template);

            return $template;
        });
    }

    /**
     * @param  array{name: string, slug: string, description?: string|null, active?: bool, is_default?: bool, fields?: array<int, array{field_id: int, visibility: string, sort_order?: int|null}>}  $data
     */
    public function update(BookingFormTemplate $template, array $data): BookingFormTemplate
    {
        return DB::transaction(function () use ($template, $data): BookingFormTemplate {
            $template->update($this->attributes($data));

            $this->syncFields($template, $data['fields'] ?? []);
            $this->ensureSingleDefault($template);

            return $template;
        });
    }

    /**
     * @param  array{name: string, slug: string, description?: string|null, active?: bool, is_default?: bool}  $data
     * @return array{name: string, slug: string, description: string|null, active: bool, is_default: bool}
     */
    private function attributes(array $data): array
    {
        return [
            'name' => $data['name'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
            'active' => $data['active'] ?? true,
            'is_default' => $data['is_default'] ?? false,
        ];
    }

    /**
     * @param  array<int, array{field_id: int, visibility: string, sort_order?: int|null}>  $fields
     */
    private function syncFields(BookingFormTemplate $template, array $fields): void
    {
        $template->templateFields()->delete();

        foreach (array_values($fields) as $index => $field) {
            $template->templateFields()->create([
                'booking_form_field_id' => $field['field_id'],
                'visibility' => $field['visibility'],
                'sort_order' => $field['sort_order'] ?? ($index + 1),
            ]);
        }
    }

    private function ensureSingleDefault(BookingFormTemplate $template): void
    {
        if (! $template->is_default) {
            return;
        }

        BookingFormTemplate::query()
            ->whereKeyNot($template->getKey())
            ->where('is_default', true)
            ->each(fn (BookingFormTemplate $other) => $other->update(['is_default' => false]));
    }
}
