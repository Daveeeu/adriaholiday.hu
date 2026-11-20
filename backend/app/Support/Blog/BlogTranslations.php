<?php

namespace App\Support\Blog;

use Closure;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Saves the translations of a blog post, category or tag. Hungarian is
 * required; English and German are optional (most legacy posts have only
 * Hungarian text), so a language left without a name or title has no
 * translation: none is created, and clearing it removes the one it had.
 */
final class BlogTranslations
{
    public const REQUIRED_LOCALE = 'hu';

    /**
     * @param  HasMany<covariant \Illuminate\Database\Eloquent\Model, covariant \Illuminate\Database\Eloquent\Model>  $relation  the owner's translations
     * @param  array<string, array<string, mixed>>  $translations  validated input, keyed by locale
     * @param  string  $nameField  the field that tells a language is written ("title", "name")
     * @param  Closure(array<string, mixed>): array<string, mixed>  $attributes  the columns of one translation
     */
    public static function sync(HasMany $relation, array $translations, string $nameField, Closure $attributes): void
    {
        foreach ($translations as $locale => $translation) {
            $written = trim((string) ($translation[$nameField] ?? '')) !== '';

            if (! $written && $locale !== self::REQUIRED_LOCALE) {
                $relation->getQuery()->clone()->where('locale', $locale)->delete();

                continue;
            }

            $relation->updateOrCreate(['locale' => $locale], $attributes($translation));
        }
    }
}
