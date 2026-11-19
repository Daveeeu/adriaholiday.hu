<?php

namespace App\Support\Seo;

/**
 * The site's /llms.txt (https://llmstxt.org): the home page's crawlable
 * content as Markdown, a summary AI assistants read to learn who the office
 * is, what it sells and which pages to open.
 */
final class LlmsTxtRenderer
{
    public function render(SeoPage $home, string $siteName): string
    {
        $body = $home->body ?? new SeoBody($siteName);
        $lines = ["# {$siteName}", ''];

        if ($home->description !== '') {
            $lines[] = '> '.$this->line($home->description);
            $lines[] = '';
        }

        if ($body->heading !== $siteName) {
            $lines[] = $this->line($body->heading);
            $lines[] = '';
        }

        foreach ($body->sections as $section) {
            if ($section->links === []) {
                continue;
            }

            $lines[] = '## '.$this->line($section->title);
            $lines[] = '';

            foreach ($section->links as $link) {
                $lines[] = '- '.$this->link($link);
            }

            $lines[] = '';
        }

        if ($body->questions !== []) {
            $lines[] = '## Gyakran ismételt kérdések';
            $lines[] = '';

            foreach ($body->questions as $item) {
                $lines[] = '- **'.$this->line($item['question']).'** '.$this->line($item['answer']);
            }

            $lines[] = '';
        }

        return implode("\n", $lines);
    }

    private function link(SeoLink $link): string
    {
        $label = $this->line($link->label);
        $text = match (true) {
            $link->path === '' => $label,
            str_starts_with($link->path, '/') => "[{$label}](".PublicSiteUrl::to($link->path).')',
            default => "[{$label}]({$link->path})",
        };

        return $link->detail !== null && $link->detail !== '' ? "{$text}: ".$this->line($link->detail) : $text;
    }

    /**
     * Text on one line, so a value never breaks the Markdown structure.
     */
    private function line(string $text): string
    {
        return trim((string) preg_replace('/\s+/u', ' ', $text));
    }
}
