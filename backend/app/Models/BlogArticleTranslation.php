<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlogArticleTranslation extends Model
{
    /** @use HasFactory<\Database\Factories\BlogArticleTranslationFactory> */
    use HasFactory;

    protected $fillable = [
        'blog_article_id',
        'locale',
        'title',
        'seo_name',
        'seo_auto_generate',
        'excerpt',
        'content',
    ];

    protected $casts = [
        'seo_auto_generate' => 'boolean',
    ];

    public function blogArticle(): BelongsTo
    {
        return $this->belongsTo(BlogArticle::class);
    }
}
