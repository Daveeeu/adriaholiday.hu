<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Database\Factories\BlogTagFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class BlogTag extends Model
{
    /** @use HasFactory<BlogTagFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    protected $fillable = [
        'active',
        'sort_order',
    ];

    protected $casts = [
        'active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function translations(): HasMany
    {
        return $this->hasMany(BlogTagTranslation::class);
    }

    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(BlogArticle::class, 'blog_article_tag');
    }
}
