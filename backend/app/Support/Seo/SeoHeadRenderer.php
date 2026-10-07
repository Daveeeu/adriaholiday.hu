<?php

namespace App\Support\Seo;

/**
 * Writes a page's SEO tags into the app's index.html head. The tags carry
 * data-rh so react-helmet-async adopts and updates them instead of adding
 * duplicates once the app runs.
 */
final class SeoHeadRenderer
{
    /**
     * Head tags the app manages; any static copy in index.html is removed first.
     */
    private const MANAGED_TAGS = [
        '~<title>.*?</title>~is',
        '~<meta\s+(?:name|property)="(?:description|robots|og:[^"]+|twitter:[^"]+)"[^>]*>~is',
        '~<link\s+rel="canonical"[^>]*>~is',
    ];

    public function render(string $html, SeoPage $page, string $siteName, bool $indexable): string
    {
        $html = (string) preg_replace(self::MANAGED_TAGS, '', $html);
        $html = (string) preg_replace("~\n\s*\n~", "\n", $html);

        return (string) preg_replace('~</head>~i', $this->tags($page, $siteName, $indexable)."\n</head>", $html, 1);
    }

    private function tags(SeoPage $page, string $siteName, bool $indexable): string
    {
        $title = $siteName !== '' && ! str_contains($page->title, $siteName) ? "{$page->title} | {$siteName}" : $page->title;
        $url = PublicSiteUrl::to($page->canonicalPath);
        $robots = $page->noIndex || ! $indexable ? 'noindex,nofollow' : 'index,follow,max-image-preview:large';

        $tags = [
            '<title data-rh="true">'.e($title).'</title>',
            $this->meta('name', 'description', $page->description),
            $this->meta('name', 'robots', $robots),
            '<link data-rh="true" rel="canonical" href="'.e($url).'">',
            $this->meta('property', 'og:site_name', $siteName),
            $this->meta('property', 'og:type', $page->ogType),
            $this->meta('property', 'og:title', $title),
            $this->meta('property', 'og:description', $page->description),
            $this->meta('property', 'og:url', $url),
            $this->meta('property', 'og:locale', 'hu_HU'),
            $page->image ? $this->meta('property', 'og:image', $page->image) : null,
            $this->meta('name', 'twitter:card', 'summary_large_image'),
            $this->meta('name', 'twitter:title', $title),
            $this->meta('name', 'twitter:description', $page->description),
            $page->image ? $this->meta('name', 'twitter:image', $page->image) : null,
        ];

        foreach ($page->jsonLd as $data) {
            $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG);
            $tags[] = '<script data-rh="true" type="application/ld+json">'.$json.'</script>';
        }

        return implode("\n    ", array_filter($tags));
    }

    private function meta(string $attribute, string $name, string $content): ?string
    {
        return $content !== '' ? '<meta data-rh="true" '.$attribute.'="'.$name.'" content="'.e($content).'">' : null;
    }
}
