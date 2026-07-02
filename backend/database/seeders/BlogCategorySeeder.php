<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use Illuminate\Database\Seeder;

class BlogCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Körutazások', 'seo_name' => 'korutazasok'],
            ['name' => 'Repülős körutazások', 'seo_name' => 'repulos-korutazasok'],
            'Tengerpartok',
            'Városnézés',
            'Világ érdekességei',
            'Gasztronómia',
            'Utazási tippek',
            'Tengerparti úticélok',
            'Családi nyaralás',
            'Apartman választás',
            'Közlekedés és transzfer',
            'Szezonális ajánlatok',
            'Programajánlók',
            'Hasznos tudnivalók',
        ];

        foreach ($categories as $index => $categoryItem) {
            $categoryName = is_array($categoryItem) ? $categoryItem['name'] : $categoryItem;
            $seoName = is_array($categoryItem) ? $categoryItem['seo_name'] : \Illuminate\Support\Str::slug($categoryName);

            $category = BlogCategory::query()->updateOrCreate(
                ['seo_name' => $seoName],
                [
                    'active' => true,
                    'column' => (string) (($index % 3) + 1),
                    'sort_order' => $index + 1,
                ],
            );

            $category->translations()->updateOrCreate(
                ['locale' => 'hu'],
                [
                    'name' => $categoryName,
                    'seo_name' => $seoName,
                    'seo_auto_generate' => true,
                ],
            );
            $category->translations()->updateOrCreate(
                ['locale' => 'en'],
                [
                    'name' => $categoryName.' EN',
                    'seo_name' => $seoName.'-en',
                    'seo_auto_generate' => true,
                ],
            );
            $category->translations()->updateOrCreate(
                ['locale' => 'de'],
                [
                    'name' => $categoryName.' DE',
                    'seo_name' => $seoName.'-de',
                    'seo_auto_generate' => true,
                ],
            );
        }
    }
}
