<?php

namespace App\Support\Seo;

/**
 * The head metadata of one public page as served to crawlers before the app
 * takes over (the app's Seo component renders the same values client-side).
 */
final class SeoPage
{
    /**
     * @param  array<int, array<string, mixed>>  $jsonLd
     */
    public function __construct(
        public readonly string $title,
        public readonly string $description,
        public readonly string $canonicalPath,
        public readonly ?string $image = null,
        public readonly string $ogType = 'website',
        public readonly array $jsonLd = [],
        public readonly bool $noIndex = false,
        public readonly int $status = 200,
        public readonly ?string $redirectTo = null,
    ) {}

    /**
     * A moved page: answered with a permanent redirect instead of the app.
     */
    public static function movedTo(string $path): self
    {
        return new self('', '', $path, status: 301, redirectTo: $path);
    }

    public static function notFound(string $path): self
    {
        return new self(
            title: 'Az oldal nem található',
            description: 'A keresett oldal nem érhető el vagy már nem létezik.',
            canonicalPath: $path,
            noIndex: true,
            status: 404,
        );
    }
}
