<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlogCategoryTranslation extends Model
{
    /** @use HasFactory<\Database\Factories\BlogCategoryTranslationFactory> */
    use HasFactory;

    protected $fillable = [
        'blog_category_id',
        'locale',
        'name',
        'seo_name',
        'seo_auto_generate',
    ];

    protected $casts = [
        'seo_auto_generate' => 'boolean',
    ];

    public function blogCategory(): BelongsTo
    {
        return $this->belongsTo(BlogCategory::class);
    }
}
