<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use Illuminate\Database\Seeder;

class BlogCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Utazási tippek',
            'Tengerparti úticélok',
            'Családi nyaralás',
            'Apartman választás',
            'Közlekedés és transzfer',
            'Szezonális ajánlatok',
            'Programajánlók',
            'Hasznos tudnivalók',
        ];

        foreach ($categories as $index => $categoryName) {
            $category = BlogCategory::query()->updateOrCreate(
                ['seo_name' => \Illuminate\Support\Str::slug($categoryName)],
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
                    'seo_name' => \Illuminate\Support\Str::slug($categoryName),
                    'seo_auto_generate' => true,
                ],
            );
            $category->translations()->updateOrCreate(
                ['locale' => 'en'],
                [
                    'name' => $categoryName.' EN',
                    'seo_name' => \Illuminate\Support\Str::slug($categoryName).'-en',
                    'seo_auto_generate' => true,
                ],
            );
            $category->translations()->updateOrCreate(
                ['locale' => 'de'],
                [
                    'name' => $categoryName.' DE',
                    'seo_name' => \Illuminate\Support\Str::slug($categoryName).'-de',
                    'seo_auto_generate' => true,
                ],
            );
        }
    }
}
