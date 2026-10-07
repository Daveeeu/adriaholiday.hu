<?php

namespace App\Services\Legacy;

use App\Models\BlogArticle;
use App\Support\MediaCategory;
use App\Support\RichTextSanitizer;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Copies blog posts exported from the legacy adriaholiday.hu admin into the new
 * blog. Posts are matched by their URL name or title, so the posts imported
 * earlier from the public site are updated (date, content; their URL is kept)
 * and nothing is duplicated.
 *
 * Images – the cover and those inside the text – are downloaded into the media
 * library, since the legacy server goes away with the domain switch; links to
 * the legacy site become site-relative so the legacy redirects take them over.
 */
class LegacyBlogImporter
{
    private const LEGACY_ORIGIN = 'https://adriaholiday.hu';

    private const EXCERPT_LENGTH = 220;

    public function __construct(private readonly LegacyMediaImporter $media) {}

    /**
     * @param  array<string, mixed>  $record
     * @return 'created'|'updated'|'invalid'
     */
    public function import(array $record, bool $dryRun): string
    {
        $title = trim((string) ($record['title'] ?? ''));
        $content = trim((string) ($record['long'] ?? ''));

        if ($title === '' || $content === '') {
            return 'invalid';
        }

        $seoName = trim((string) ($record['seoName'] ?? '')) ?: Str::slug($title);
        $article = BlogArticle::query()
            ->whereHas('translations', fn ($query) => $query->where('locale', 'hu')
                ->where(fn ($match) => $match->where('seo_name', $seoName)->orWhere('title', $title)))
            ->with('translations')
            ->first();
        // An existing post keeps its URL; some legacy URL names are placeholders ("teszt-2").
        $seoName = $article?->translations->firstWhere('locale', 'hu')?->seo_name ?: $seoName;

        if ($dryRun) {
            return $article ? 'updated' : 'created';
        }

        $cover = $this->localImage((string) ($record['image'] ?? ''), $title);
        $body = (string) RichTextSanitizer::sanitize($this->rewrittenContent($content, $title));
        $excerpt = trim((string) ($record['short'] ?? '')) ?: $this->excerpt($body);

        DB::transaction(function () use ($article, $record, $title, $seoName, $cover, $body, $excerpt): void {
            $article ??= new BlogArticle;
            $article->fill([
                'active' => (string) ($record['status'] ?? '1') === '1',
                'published_at' => $this->date((string) ($record['date'] ?? '')),
                'portfolio_featured' => (string) ($record['accentuated'] ?? '0') === '1',
                'image' => $cover,
                'image_title' => trim((string) ($record['imageTitle'] ?? '')) ?: $title,
            ])->save();

            $article->translations()->updateOrCreate(
                ['locale' => 'hu'],
                [
                    'title' => $title,
                    'seo_name' => $seoName,
                    'seo_auto_generate' => false,
                    'excerpt' => RichTextSanitizer::sanitize($excerpt),
                    'content' => $body,
                ],
            );
        });

        return $article ? 'updated' : 'created';
    }

    /**
     * Downloads the inline images and makes legacy links site-relative.
     */
    private function rewrittenContent(string $html, string $title): string
    {
        $html = (string) preg_replace_callback(
            '/(<img\b[^>]*\bsrc=")([^"]+)(")/i',
            fn (array $match): string => $match[1].($this->localImage(html_entity_decode($match[2]), $title) ?? $match[2]).$match[3],
            $html,
        );

        return (string) preg_replace_callback(
            '/(\bhref=")([^"]+)(")/i',
            fn (array $match): string => $match[1].$this->sitePath($match[2]).$match[3],
            $html,
        );
    }

    /**
     * The site-relative URL of a legacy image after importing it, or null when it
     * cannot be downloaded (the original reference is then kept).
     */
    private function localImage(string $source, string $title): ?string
    {
        $url = $this->legacyFileUrl($source);

        if ($url === null) {
            return null;
        }

        try {
            $media = $this->media->importImage($url, ['alt' => $title, 'title' => $title, 'category' => MediaCategory::BLOG]);
        } catch (LegacyFetchException $exception) {
            report($exception);

            return null;
        }

        return parse_url($media->getUrl(), PHP_URL_PATH) ?: null;
    }

    /**
     * The original file behind a legacy image reference: "files/x.jpg", an absolute
     * legacy URL, or the legacy resizer ("framework/img.php?p=files/x.jpg&op=…").
     */
    private function legacyFileUrl(string $source): ?string
    {
        $source = trim($source);

        if (preg_match('~img\.php\?p=([^&]+)~', $source, $match)) {
            $source = rawurldecode($match[1]);
        }

        $path = preg_replace('~^(?:https?:)?//(?:www\.)?adriaholiday\.hu/~i', '', $source);

        if ($path === null || preg_match('~^(?:https?:)?//~i', $path) || ! str_starts_with(ltrim($path, '/'), 'files/')) {
            return null;
        }

        return self::LEGACY_ORIGIN.'/'.ltrim($path, '/');
    }

    private function sitePath(string $href): string
    {
        $decoded = html_entity_decode(trim($href));

        if (preg_match('~^(?:https?:)?//(?:www\.)?adriaholiday\.hu(/.*)?$~i', $decoded, $match)) {
            return $match[1] ?? '/';
        }

        // Legacy links relative to the site root ("korutazasok/…") would resolve under /blog/.
        if (! preg_match('~^(?:[a-z][a-z0-9+.-]*:|/|#)~i', $decoded)) {
            return '/'.$decoded;
        }

        return $href;
    }

    private function excerpt(string $html): string
    {
        $withBreaks = (string) preg_replace('~</(?:p|h[1-6]|li|div)>|<br\s*/?>~i', ' ', $html);
        $text = trim((string) preg_replace('/\s+/u', ' ', html_entity_decode(strip_tags($withBreaks), ENT_QUOTES | ENT_HTML5, 'UTF-8')));

        return Str::limit($text, self::EXCERPT_LENGTH, '…', preserveWords: true);
    }

    private function date(string $value): CarbonImmutable
    {
        return preg_match('/^\d{4}-\d{2}-\d{2}/', $value) ? CarbonImmutable::parse($value) : CarbonImmutable::now();
    }
}
