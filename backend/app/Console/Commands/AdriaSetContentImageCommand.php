<?php

namespace App\Console\Commands;

use App\Models\PortfolioContentBlock;
use App\Services\PortfolioContent\PortfolioContentService;
use App\Support\PublicContentCache;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class AdriaSetContentImageCommand extends Command
{
    private const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

    protected $signature = 'adria:set-content-image
        {key : Key of an image content block, e.g. about.team.member.1.image}
        {path : Image file to attach (JPEG, PNG or WebP)}
        {--alt= : Alternative text; defaults to the block\'s current alt text}';

    protected $description = 'Attach an image to an editable portfolio content block and publish it, the same way an upload and publish in the editor does.';

    public function handle(PortfolioContentService $content): int
    {
        $key = (string) $this->argument('key');
        $path = (string) $this->argument('path');

        $block = PortfolioContentBlock::query()->where('key', $key)->first();

        if ($block === null || ! $block->isMediaField()) {
            $this->error("No image content block exists with the key [{$key}].");

            return self::FAILURE;
        }

        if (! is_file($path) || ! in_array(mime_content_type($path), self::ALLOWED_MIME_TYPES, true)) {
            $this->error("[{$path}] is not a readable JPEG, PNG or WebP image.");

            return self::FAILURE;
        }

        $alt = $this->option('alt') ?: data_get($block->draft_value_json ?? $block->value_json, 'alt');
        $extension = Str::lower(pathinfo($path, PATHINFO_EXTENSION));
        $fileName = Str::slug(pathinfo($path, PATHINFO_FILENAME)).'.'.($extension === 'jpeg' ? 'jpg' : $extension);

        $content->storeDraftMedia($block, $path, $fileName, ['alt' => $alt, 'title' => $alt]);
        $content->publish($block, null);

        PublicContentCache::bump(PublicContentCache::HOMEPAGE_CONTENT);

        $this->info("Published {$fileName} on [{$key}].");

        return self::SUCCESS;
    }
}
