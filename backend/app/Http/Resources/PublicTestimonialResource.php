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
            'publishedAt' => $this->published_at?->toDateString(),
        ];
    }
}
