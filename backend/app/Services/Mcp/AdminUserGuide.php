<?php

namespace App\Services\Mcp;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * The admin's user guide (written in adria-admin/src/features/user-guide and
 * exported to resources/user-guide/user-guide.json by `npm run
 * user-guide:export`), searchable for the AI assistant: how a screen works,
 * where a setting is and what each field does, with the screenshots.
 */
class AdminUserGuide
{
    public const SOURCE = 'user-guide/user-guide.json';

    /**
     * Matches in a topic's title or menu path weigh more than ones in its text.
     */
    private const TITLE_WEIGHT = 3;

    /** @var array<int, array<string, mixed>>|null */
    private ?array $chapters = null;

    /**
     * The topics that best match the question, best first.
     *
     * @return Collection<int, array{chapter: array<string, mixed>, topic: array<string, mixed>, score: int}>
     */
    public function search(string $query, int $limit): Collection
    {
        $terms = collect(preg_split('/\s+/u', $this->normalize($query)) ?: [])
            ->filter(fn (string $term): bool => mb_strlen($term) >= 3)
            ->unique()
            ->values();

        if ($terms->isEmpty()) {
            return collect();
        }

        return $this->topics()
            ->map(function (array $entry) use ($terms): array {
                $title = $this->normalize(implode(' ', [$entry['topic']['title'], $entry['topic']['menu'] ?? '', $entry['chapter']['title']]));
                $text = $this->normalize(implode(' ', $this->topicTexts($entry['topic'])));

                $score = $terms->sum(fn (string $term): int => (str_contains($title, $term) ? self::TITLE_WEIGHT : 0) + (str_contains($text, $term) ? 1 : 0));

                return [...$entry, 'score' => $score];
            })
            ->filter(fn (array $entry): bool => $entry['score'] > 0)
            ->sortByDesc('score')
            ->take($limit)
            ->values();
    }

    /**
     * @return array{chapter: array<string, mixed>, topic: array<string, mixed>}|null
     */
    public function find(string $topicId): ?array
    {
        return $this->topics()->first(fn (array $entry): bool => $entry['topic']['id'] === $topicId);
    }

    /**
     * Every chapter with its topics' ids and titles: the guide's table of contents.
     *
     * @return array<int, array{id: string, title: string, description: string, topics: array<int, array{id: string, title: string}>}>
     */
    public function contents(): array
    {
        return array_map(fn (array $chapter): array => [
            'id' => $chapter['id'],
            'title' => $chapter['title'],
            'description' => $chapter['description'],
            'topics' => array_map(fn (array $topic): array => ['id' => $topic['id'], 'title' => $topic['title']], $chapter['topics']),
        ], $this->chapters());
    }

    /**
     * The topic as Markdown text, with its screenshots' file names in order.
     *
     * @param  array<string, mixed>  $topic
     * @return array{markdown: string, images: array<int, array{file: string, caption: string}>}
     */
    public function render(array $topic): array
    {
        $lines = ["# {$topic['title']}", '', $topic['summary']];
        $images = [];

        foreach (['menu' => 'Menü', 'access' => 'Jogosultság'] as $key => $label) {
            if (! empty($topic[$key])) {
                $lines[] = "{$label}: {$topic[$key]}";
            }
        }

        foreach ($topic['blocks'] as $block) {
            array_push($lines, '', ...$this->blockLines($block));

            if ($block['type'] === 'image') {
                $images[] = ['file' => $block['image']['file'], 'caption' => $block['image']['caption']];
            }
        }

        return ['markdown' => trim(implode("\n", $lines)), 'images' => $images];
    }

    /**
     * @param  array<string, mixed>  $block
     * @return array<int, string>
     */
    private function blockLines(array $block): array
    {
        return match ($block['type']) {
            'paragraph' => [$block['text']],
            'tip' => ["Tipp: {$block['text']}"],
            'warning' => ["Figyelem: {$block['text']}"],
            'list', 'steps' => $this->listLines($block),
            'fields' => $this->fieldLines($block),
            'image' => ["[Képernyőkép {$block['image']['file']}: {$block['image']['caption']}]"],
            default => [],
        };
    }

    /**
     * @param  array<string, mixed>  $block
     * @return array<int, string>
     */
    private function listLines(array $block): array
    {
        $lines = isset($block['title']) ? ["## {$block['title']}"] : [];

        foreach (array_values($block['items']) as $index => $item) {
            $lines[] = ($block['type'] === 'steps' ? ($index + 1).'.' : '-')." {$item}";
        }

        return $lines;
    }

    /**
     * @param  array<string, mixed>  $block
     * @return array<int, string>
     */
    private function fieldLines(array $block): array
    {
        $lines = ["## {$block['title']}"];

        if (! empty($block['description'])) {
            $lines[] = $block['description'];
        }

        foreach ($block['fields'] as $field) {
            $lines[] = "- {$field['name']}: {$field['description']}".(! empty($field['appearsAt']) ? " (Hol látszik: {$field['appearsAt']})" : '');
        }

        return $lines;
    }

    /**
     * @param  array<string, mixed>  $topic
     * @return array<int, string>
     */
    private function topicTexts(array $topic): array
    {
        return collect($topic['blocks'])
            ->flatMap(fn (array $block): array => $this->blockLines($block))
            ->prepend($topic['summary'])
            ->all();
    }

    /**
     * @return Collection<int, array{chapter: array<string, mixed>, topic: array<string, mixed>}>
     */
    private function topics(): Collection
    {
        return collect($this->chapters())
            ->flatMap(fn (array $chapter): array => array_map(
                fn (array $topic): array => ['chapter' => $chapter, 'topic' => $topic],
                $chapter['topics'],
            ))
            ->values();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function chapters(): array
    {
        return $this->chapters ??= json_decode(File::get(resource_path(self::SOURCE)), true, flags: JSON_THROW_ON_ERROR)['chapters'];
    }

    /** Lower-case and without accents, so "arfolyam" also finds "árfolyam". */
    private function normalize(string $text): string
    {
        return Str::lower(Str::ascii($text));
    }
}
