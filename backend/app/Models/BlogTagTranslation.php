<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlogTagTranslation extends Model
{
    /** @use HasFactory<\Database\Factories\BlogTagTranslationFactory> */
    use HasFactory;

    protected $fillable = [
        'blog_tag_id',
        'locale',
        'name',
    ];

    public function blogTag(): BelongsTo
    {
        return $this->belongsTo(BlogTag::class);
    }
}
