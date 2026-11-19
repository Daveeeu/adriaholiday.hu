<?php

namespace App\Support\Seo;

/**
 * Writes a page's crawlable content into the app's root element of
 * index.html. Browsers that run JavaScript hide it until the app replaces the
 * root's content on start, so visitors never see it flash; crawlers that do
 * not run JavaScript read it as the page.
 */
final class SeoBodyRenderer
{
    private const ROOT = '~<div id="root">\s*</div>~i';

    /**
     * Marks the document as scripted before the body renders, so the content
     * below stays hidden for browsers that run the app.
     */
    private const HIDE_WHEN_SCRIPTED = '<script>document.documentElement.classList.add("js")</script>'
        .'<style>.js [data-seo-content]{display:none}</style>';

    public function render(string $html, SeoBody $body): string
    {
        if (preg_match(self::ROOT, $html) !== 1) {
            return $html;
        }

        $html = (string) preg_replace('~</head>~i', self::HIDE_WHEN_SCRIPTED."\n</head>", $html, 1);

        return (string) preg_replace_callback(
            self::ROOT,
            fn (): string => '<div id="root">'.$this->content($body).'</div>',
            $html,
            1,
        );
    }

    private function content(SeoBody $body): string
    {
        $parts = ['<h1>'.e($body->heading).'</h1>'];

        foreach ($body->paragraphs as $paragraph) {
            $parts[] = '<p>'.e($paragraph).'</p>';
        }

        if ($body->questions !== []) {
            $parts[] = '<section><h2>Gyakran ismételt kérdések</h2>'.implode('', array_map(
                fn (array $item): string => '<h3>'.e($item['question']).'</h3><p>'.e($item['answer']).'</p>',
                $body->questions,
            )).'</section>';
        }

        foreach ($body->sections as $section) {
            if ($section->links === []) {
                continue;
            }

            $parts[] = '<section><h2>'.e($section->title).'</h2><ul>'.implode('', array_map($this->link(...), $section->links)).'</ul></section>';
        }

        return '<div data-seo-content>'.implode('', $parts).'</div>';
    }

    private function link(SeoLink $link): string
    {
        $anchor = $link->path !== '' ? '<a href="'.e($link->path).'">'.e($link->label).'</a>' : e($link->label);

        return '<li>'.$anchor.($link->detail !== null && $link->detail !== '' ? ' – '.e($link->detail) : '').'</li>';
    }
}
