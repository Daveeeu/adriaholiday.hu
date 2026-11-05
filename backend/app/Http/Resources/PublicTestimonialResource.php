<?php

namespace App\Http\Resources;

use App\Models\Testimonial;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Testimonial
 */
class PublicTestimonialResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'author' => $this->author,
            'excerpt' => $this->excerpt(),
            'body' => $this->body,
            // The letter still sorts by its date when the office keeps it hidden.
            'publishedAt' => $this->show_date ? $this->published_at?->toDateString() : null,
        ];
    }
}
