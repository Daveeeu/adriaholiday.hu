<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingFormFieldResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'key' => $this->key,
            'label' => $this->label,
            'description' => $this->description,
            'priceLabel' => $this->price_label,
            'fieldType' => $this->field_type,
            'inputGroup' => $this->input_group,
            'sortOrder' => (int) $this->sort_order,
            'options' => $this->options,
            'disabledOptions' => $this->disabled_options ?? [],
            'isSystem' => $this->isSystem(),
        ];
    }
}
