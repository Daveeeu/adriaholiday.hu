<?php

namespace App\Support\Tour;

use App\Models\BlogCategory;
use App\Support\TourLabelResolver;

/**
 * What a new tour starts with in the editor: the round trips category
 * ("Körutazások"), which the office may take off or change.
 */
final class NewTourDefaults
{
    /** The web address of the category every new tour starts in. */
    public const CATEGORY_SLUG = 'korutazasok';

    /**
     * @return array{categoryIds: list<string>, categories: list<array{id: string, label: string}>}
     */
    public static function get(): array
    {
        $id = BlogCategory::query()->where('seo_name', self::CATEGORY_SLUG)->where('active', true)->value('id');
        $ids = $id !== null ? [(string) $id] : [];

        return [
            'categoryIds' => $ids,
            'categories' => TourLabelResolver::blogCategoryItems($ids),
        ];
    }
}
