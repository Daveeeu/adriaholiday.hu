<?php

namespace Database\Seeders;

use App\Models\BlogArticle;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use Database\Seeders\Concerns\CreatesPlaceholderMedia;
use Database\Seeders\Concerns\SeedsMediaFromUrl;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Support\MediaCategory;

class BlogArticleSeeder extends Seeder
{
    use CreatesPlaceholderMedia;
    use SeedsMediaFromUrl;

    public function run(): void
    {
        $categories = BlogCategory::query()->orderBy('id')->get()->values();
        $tags = BlogTag::query()->orderBy('id')->get()->values();

        $portfolioArticles = [
            [
                'title' => 'Horvátország 10 legszebb strandja',
                'excerpt' => 'Kristálytiszta víz, rejtett öblök és mediterrán hangulat — fedezd fel Horvátország legszebb tengerpartjait.',
                'image' => 'https://adriaholiday.hu/framework/img.php?p=files/brela.jpeg&op=;1200x900;',
                'category' => 'Tengerpartok',
                'published_at' => '2026-01-25 00:00:00',
                'reading_time' => '5 perc',
                'featured' => true,
                'sort_order' => 1,
                'tags' => ['Horvátország', 'Tengerparti úticélok'],
            ],
            [
                'title' => 'Karneváli maszkok Velencében',
                'excerpt' => 'A velencei karnevál története, legendás maszkjai és a város különleges hangulata.',
                'image' => 'https://adriaholiday.hu/framework/img.php?p=files/carnival_venice_italy031-2.jpg&op=;800x720;',
                'category' => 'Városnézés',
                'published_at' => '2026-01-19 00:00:00',
                'reading_time' => '4 perc',
                'featured' => true,
                'sort_order' => 2,
                'tags' => ['Városnézés', 'Olaszország'],
            ],
            [
                'title' => 'Érdekes szobrok a nagyvilágban',
                'excerpt' => 'Különleges és ikonikus szobrok, amelyek mellett utazás közben egyszer mindenképp érdemes megállni.',
                'image' => 'https://adriaholiday.hu/framework/img.php?p=files/28279603_1824636157580731_3729580786296626111_n.jpg&op=;800x720;',
                'category' => 'Világ érdekességei',
                'published_at' => '2026-04-12 00:00:00',
                'reading_time' => '6 perc',
                'featured' => true,
                'sort_order' => 3,
                'tags' => ['Érdekesség', 'Utazási tippek'],
            ],
            [
                'title' => 'Miért ismert világszerte a kubai szivar?',
                'excerpt' => 'Hagyomány, kézművesség és kubai kultúra — ezért vált legendává a kubai szivar.',
                'image' => 'https://adriaholiday.hu/framework/img.php?p=files/shutterstock_301377860%20%28002%29.jpg&op=;800x720;',
                'category' => 'Gasztronómia',
                'published_at' => '2026-11-25 00:00:00',
                'reading_time' => '5 perc',
                'featured' => true,
                'sort_order' => 4,
                'tags' => ['Gasztronómia', 'Különlegességek'],
            ],
        ];

        foreach ($portfolioArticles as $index => $data) {
            $article = BlogArticle::query()->updateOrCreate(
                ['sort_order' => $data['sort_order']],
                [
                    'active' => true,
                    'published_at' => $data['published_at'],
                    'show_on_homepage' => false,
                    'portfolio_featured' => $data['featured'],
                    'portfolio_sort_order' => $data['sort_order'],
                    'image' => $data['image'],
                    'image_title' => $data['title'],
                    'views' => 100 + $index,
                ],
            );

            $article->clearMediaCollection('cover');
            $this->attachMediaFromUrl(
                $article,
                'cover',
                $data['image'],
                Str::slug($data['title']).'.jpg',
                $data['title'],
                [
                    'category' => MediaCategory::BLOG->value,
                    'source_context' => 'blog_article',
                    'source_id' => $article->id,
                    'alt' => $data['title'],
                    'title' => $data['title'],
                ],
            );

            $article->translations()->updateOrCreate(
                ['locale' => 'hu'],
                [
                    'title' => $data['title'],
                    'seo_name' => Str::slug($data['title']),
                    'seo_auto_generate' => true,
                    'excerpt' => $data['excerpt'],
                    'content' => $data['excerpt'].' '.$data['title'].' részletes tartalma.',
                ],
            );
            $article->translations()->updateOrCreate(
                ['locale' => 'en'],
                [
                    'title' => Str::headline(Str::slug($data['title'], ' ')).' EN',
                    'seo_name' => Str::slug($data['title']).'-en',
                    'seo_auto_generate' => true,
                    'excerpt' => 'Short article summary for '.$data['title'].'.',
                    'content' => 'Detailed article content for '.$data['title'].'.',
                ],
            );
            $article->translations()->updateOrCreate(
                ['locale' => 'de'],
                [
                    'title' => Str::headline(Str::slug($data['title'], ' ')).' DE',
                    'seo_name' => Str::slug($data['title']).'-de',
                    'seo_auto_generate' => true,
                    'excerpt' => 'Kurze Zusammenfassung zu '.$data['title'].'.',
                    'content' => 'Detaillierter Inhalt zu '.$data['title'].'.',
                ],
            );

            $category = $categories->firstWhere('seo_name', Str::slug($data['category']))
                ?? $categories->first();
            $tagIds = $tags
                ->filter(fn (BlogTag $tag) => in_array($tag->translations->firstWhere('locale', 'hu')?->name ?? '', $data['tags'], true))
                ->pluck('id')
                ->all();

            $article->categories()->sync([$category->id]);
            $article->tags()->sync($tagIds);
        }

        $genericTitles = [
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

        foreach ($genericTitles as $i => $title) {
            $sortOrder = $i + 5;
            $article = BlogArticle::query()->updateOrCreate(
                ['sort_order' => $sortOrder],
                [
                    'active' => true,
                    'published_at' => now()->subDays($sortOrder),
                    'show_on_homepage' => $sortOrder <= 9,
                    'portfolio_featured' => false,
                    'portfolio_sort_order' => 0,
                    'image_title' => $title,
                    'views' => $sortOrder * 10,
                ],
            );

            $article->clearMediaCollection('cover');
            $this->attachPlaceholderMedia($article, 'cover', $title, [
                'category' => MediaCategory::BLOG->value,
                'source_context' => 'blog_article',
                'source_id' => $article->id,
                'alt' => $title,
                'title' => $title,
            ]);

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
