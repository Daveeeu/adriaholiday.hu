<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use Database\Factories\BlogCategoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class BlogCategory extends Model
{
    /** @use HasFactory<BlogCategoryFactory> */
    use HasFactory, LogsModelActivity, SoftDeletes;

    private const LOCALES = ['hu', 'en', 'de'];

    protected $fillable = [
        'active',
        'column',
        'seo_name',
        'sort_order',
    ];

    protected $casts = [
        'active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * The category whose (or whose translation's) seo name is the slug of
     * the given name, created with that name in every locale when missing — the same shape
     * the admin's quick-create gives a category.
     */
    public static function firstOrCreateForName(string $name): self
    {
        $seoName = Str::slug($name);

        $category = self::query()
            ->where('seo_name', $seoName)
            ->orWhereHas('translations', fn ($query) => $query->where('seo_name', $seoName))
            ->first();

        if ($category !== null) {
            return $category;
        }

        $category = self::query()->create([
            'active' => true,
            'column' => '1',
            'sort_order' => 0,
            'seo_name' => $seoName,
        ]);

        foreach (self::LOCALES as $locale) {
            $category->translations()->create([
                'locale' => $locale,
                'name' => $name,
                'seo_name' => $seoName,
                'seo_auto_generate' => true,
            ]);
        }

        return $category;
    }

    public function translations(): HasMany
    {
        return $this->hasMany(BlogCategoryTranslation::class);
    }

    public function articles(): BelongsToMany
    {
        return $this->belongsToMany(BlogArticle::class, 'blog_article_category');
    }
}
