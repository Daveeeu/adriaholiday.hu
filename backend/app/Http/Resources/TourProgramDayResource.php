<?php

namespace App\Http\Resources;

use App\Support\RichTextSanitizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourProgramDayResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tourId' => $this->tour_id,
            'sortOrder' => (int) $this->sort_order,
            'dayNumber' => (int) $this->day_number,
            'title' => trim((string) $this->title),
            'description' => RichTextSanitizer::sanitize($this->description),
            'image' => $this->image ? trim((string) $this->image) : null,
            'icon' => $this->icon ? trim((string) $this->icon) : null,
            'experienceType' => $this->experience_type ? trim((string) $this->experience_type) : null,
            'badges' => collect($this->badges ?? [])
                ->map(fn ($badge): string => trim((string) $badge))
                ->filter()
                ->values()
                ->all(),
            'active' => (bool) $this->active,
        ];
    }
}
