<?php

namespace App\Console\Commands;

use App\Services\Legacy\LegacyBlogImporter;
use App\Support\PublicContentCache;
use Illuminate\Console\Command;

class AdriaImportLegacyBlogCommand extends Command
{
    protected $signature = 'adria:import-legacy-blog
        {path : JSON file with the blog posts exported from the legacy admin}
        {--dry-run : Report what would be imported without writing or downloading anything}';

    protected $description = 'Import the blog posts exported from the legacy adriaholiday.hu admin (matched by URL name, images downloaded).';

    public function handle(LegacyBlogImporter $importer): int
    {
        $records = json_decode((string) @file_get_contents((string) $this->argument('path')), true);

        if (! is_array($records)) {
            $this->error('The file is missing or is not a JSON array of posts.');

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');
        $counts = ['created' => 0, 'updated' => 0, 'invalid' => 0];

        foreach ($records as $record) {
            $outcome = $importer->import(is_array($record) ? $record : [], $dryRun);
            $counts[$outcome]++;
            $this->line(sprintf('[%s] %s', strtoupper($outcome), $record['title'] ?? '?'));
        }

        if (! $dryRun) {
            PublicContentCache::bump(PublicContentCache::BLOG, PublicContentCache::SITEMAP);
        }

        $this->table(['Result', 'Count'], collect($counts)->map(fn (int $count, string $outcome): array => [$outcome, $count])->values()->all());

        return self::SUCCESS;
    }
}
