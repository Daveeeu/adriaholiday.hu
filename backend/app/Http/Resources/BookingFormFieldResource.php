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
            'fieldType' => $this->field_type,
            'inputGroup' => $this->input_group,
            'sortOrder' => (int) $this->sort_order,
            'options' => $this->options,
        ];
    }
}
