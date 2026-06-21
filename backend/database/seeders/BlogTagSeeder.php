<?php

namespace Database\Seeders;

use App\Models\BlogTag;
use Illuminate\Database\Seeder;

class BlogTagSeeder extends Seeder
{
    public function run(): void
    {
        $tags = [
            'Bibione',
            'Lignano',
            'Caorle',
            'Jesolo',
            'Sarti',
            'Nei Pori',
            'Budva',
            'Rovinj',
            'Napospart',
            'Apartman',
            'Családi nyaralás',
            'Transzfer',
        ];

        foreach ($tags as $index => $tagName) {
            $tag = BlogTag::query()->updateOrCreate(
                ['sort_order' => $index + 1],
                ['active' => true],
            );

            $tag->translations()->updateOrCreate(
                ['locale' => 'hu'],
                ['name' => $tagName],
            );
            $tag->translations()->updateOrCreate(
                ['locale' => 'en'],
                ['name' => $tagName.' EN'],
            );
            $tag->translations()->updateOrCreate(
                ['locale' => 'de'],
                ['name' => $tagName.' DE'],
            );
        }
    }
}
