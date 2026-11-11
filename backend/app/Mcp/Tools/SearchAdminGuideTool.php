<?php

namespace App\Mcp\Tools;

use App\Services\Mcp\AdminUserGuide;
use App\Services\Mcp\McpImages;
use App\Services\Mcp\McpLinks;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Attributes\Description;
use Laravel\Mcp\Server\Attributes\Name;
use Laravel\Mcp\Server\Attributes\Title;
use Laravel\Mcp\Server\Tools\Annotations\IsIdempotent;
use Laravel\Mcp\Server\Tools\Annotations\IsReadOnly;

#[Name('search_admin_guide')]
#[Title('Admin kézikönyv')]
#[Description('The admin user guide: how to do something in the admin (e.g. "add a new departure date", "change a booking status", "upload a gallery image"), where a setting is and what each field does. Returns the best matching topics in full, step by step, and sends the matching screenshots as images. Without a query it returns the table of contents. Always use it for "how do I…" questions instead of guessing.')]
#[IsReadOnly]
#[IsIdempotent]
class SearchAdminGuideTool extends AdminTool
{
    private const DEFAULT_TOPICS = 2;

    private const MAX_TOPICS = 5;

    private const DEFAULT_SCREENSHOTS = 2;

    private const MAX_SCREENSHOTS = 3;

    public function __construct(
        private readonly AdminUserGuide $guide,
        private readonly McpImages $images,
        private readonly McpLinks $links,
    ) {}

    /**
     * Every staff member who may connect an assistant may read the guide.
     */
    protected function permission(): string
    {
        return 'mcp.access';
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()->description('Hungarian keywords of the task or screen, e.g. "időpont felár", "foglalás státusz", "galéria kép". Leave empty for the table of contents.'),
            'topic_id' => $schema->string()->description('Or a topic id from the table of contents or an earlier result, to read that topic.'),
            'topics' => $schema->integer()->min(1)->max(self::MAX_TOPICS)->description('How many matching topics to return (default 2).'),
            'screenshots' => $schema->integer()->min(0)->max(self::MAX_SCREENSHOTS)->description('How many screenshots to send (default 2, max 3).'),
        ];
    }

    public function handle(Request $request): ResponseFactory|Response
    {
        $validated = $request->validate([
            'query' => ['nullable', 'string', 'max:200'],
            'topic_id' => ['nullable', 'string', 'max:100'],
            'topics' => ['nullable', 'integer', 'min:1', 'max:'.self::MAX_TOPICS],
            'screenshots' => ['nullable', 'integer', 'min:0', 'max:'.self::MAX_SCREENSHOTS],
        ]);

        if (($topicId = $validated['topic_id'] ?? null) !== null) {
            $entry = $this->guide->find($topicId);
            $matches = $entry !== null ? collect([$entry]) : collect();
        } elseif (trim($validated['query'] ?? '') !== '') {
            $matches = $this->guide->search($validated['query'], $validated['topics'] ?? self::DEFAULT_TOPICS);
        } else {
            return $this->respond(['table_of_contents' => $this->guide->contents()]);
        }

        if ($matches->isEmpty()) {
            return Response::error('A kézikönyvben nincs erről szóló rész. Próbáld más kulcsszavakkal, vagy kérd le a tartalomjegyzéket query nélkül.');
        }

        $rendered = $matches->map(fn (array $entry): array => [...$entry, ...$this->guide->render($entry['topic'])]);

        $topics = $rendered->map(fn (array $entry): array => [
            'topic_id' => $entry['topic']['id'],
            'chapter' => $entry['chapter']['title'],
            'admin_url' => isset($entry['topic']['path']) ? $this->links->admin($entry['topic']['path']) : null,
            'text' => $entry['markdown'],
            'screenshots' => array_map(fn (array $image): array => [
                'caption' => $image['caption'],
                'url' => $this->links->admin("guide-images/{$image['file']}.webp"),
            ], $entry['images']),
        ]);

        $screenshots = $rendered
            ->flatMap(fn (array $entry): array => $entry['images'])
            ->map(fn (array $image): ?Response => $this->images->fromGuide($image['file']))
            ->filter()
            ->take($validated['screenshots'] ?? self::DEFAULT_SCREENSHOTS)
            ->values()
            ->all();

        return $this->respond(['topics' => $topics->values()->all()], $screenshots);
    }
}
