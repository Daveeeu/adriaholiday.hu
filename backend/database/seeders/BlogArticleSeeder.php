<?php

namespace Database\Seeders;

use App\Models\BlogArticle;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use Database\Seeders\Concerns\CreatesPlaceholderMedia;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BlogArticleSeeder extends Seeder
{
    use CreatesPlaceholderMedia;

    public function run(): void
    {
        $categories = BlogCategory::query()->orderBy('id')->get()->values();
        $tags = BlogTag::query()->orderBy('id')->get()->values();

        $titles = [
            'Bibione családi apartman tippek',
            'Lignano legjobb strandjai',
            'Caorle őszi utazási ötletek',
            'Jesolo kényelmes nyaralási csomagok',
            'Sarti és Halkidiki útiterv',
            'Nei Pori apartmanválasztási tanácsok',
            'Paralia tengerparti hétvégék',
            'Hanioti nyári ajánlatok',
            'Budva városi és tengerparti élmények',
            'Petrovac nyugodt családi nyaralás',
            'Ulcinj hosszú strandos programok',
            'Bar közel a tengerhez',
            'Rovinj romantikus utazás',
            'Poreč apartmanok és programok',
            'Crikvenica családi pihenés',
            'Makarska Riviera: mit érdemes tudni',
            'Napospart all inclusive útikalauz',
            'Aranyhomok utazási tippek',
            'Neszebár kulturális látnivalók',
            'Szozopol nyaralási útmutató',
        ];

        foreach (range(1, 20) as $i) {
            $title = $titles[$i - 1];
            $article = BlogArticle::query()->updateOrCreate(
                ['sort_order' => $i],
                [
                    'active' => true,
                    'published_at' => now()->subDays($i),
                    'show_on_homepage' => $i <= 5,
                    'image_title' => $title,
                    'views' => $i * 10,
                ],
            );

            $article->clearMediaCollection('cover');
            $this->attachPlaceholderMedia($article, 'cover', $title);

            $article->translations()->updateOrCreate(
                ['locale' => 'hu'],
                [
                    'title' => $title,
                    'seo_name' => Str::slug($title),
                    'seo_auto_generate' => true,
                    'excerpt' => "{$title} rövid kivonata.",
                    'content' => "{$title} részletes tartalma.",
                ],
            );
            $article->translations()->updateOrCreate(
                ['locale' => 'en'],
                [
                    'title' => Str::headline(Str::slug($title, ' ')).' EN',
                    'seo_name' => Str::slug($title).'-en',
                    'seo_auto_generate' => true,
                    'excerpt' => "Short article summary for {$title}.",
                    'content' => "Detailed article content for {$title}.",
                ],
            );
            $article->translations()->updateOrCreate(
                ['locale' => 'de'],
                [
                    'title' => Str::headline(Str::slug($title, ' ')).' DE',
                    'seo_name' => Str::slug($title).'-de',
                    'seo_auto_generate' => true,
                    'excerpt' => "Kurze Zusammenfassung zu {$title}.",
                    'content' => "Detaillierter Inhalt zu {$title}.",
                ],
            );

            $article->categories()->sync(
                $categories->random(min(2, $categories->count()))->pluck('id')->all(),
            );
            $article->tags()->sync(
                $tags->random(min(3, $tags->count()))->pluck('id')->all(),
            );
        }
    }
}
