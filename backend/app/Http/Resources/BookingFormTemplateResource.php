<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingFormTemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'active' => (bool) $this->active,
            'fields' => $this->whenLoaded('templateFields', fn () => $this->templateFields
                ->sortBy('sort_order')
                ->values()
                ->map(fn ($templateField): array => [
                    'id' => $templateField->id,
                    'fieldId' => $templateField->booking_form_field_id,
                    'key' => $templateField->field?->key,
                    'label' => $templateField->field?->label,
                    'fieldType' => $templateField->field?->field_type,
                    'inputGroup' => $templateField->field?->input_group,
                    'options' => $templateField->field?->options,
                    'visibility' => $templateField->visibility,
                    'sortOrder' => (int) $templateField->sort_order,
                ])
                ->all()),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
