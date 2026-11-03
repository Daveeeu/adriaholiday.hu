<?php

namespace App\Services\Legacy;

use App\Models\Testimonial;
use Carbon\CarbonImmutable;

/**
 * Copies a guest letter ("Rólunk írták") of the legacy admin into the
 * testimonials, once: an entry already imported (by its legacy id) is left as
 * the office may have edited it.
 */
final class LegacyTestimonialImporter
{
    /**
     * A closing paragraph this short is the letter's signature (e.g. "B Istvánné").
     */
    private const SIGNATURE_MAX_LENGTH = 40;

    /**
     * @param  array<string, mixed>  $record  id, title, content or intro, createdAt
     */
    public function import(array $record, bool $dryRun): LegacyImportOutcome|false
    {
        $legacyId = (int) ($record['id'] ?? 0);
        $title = trim((string) ($record['title'] ?? ''));
        $body = trim((string) ($record['content'] ?? '') ?: (string) ($record['intro'] ?? ''));

        if ($legacyId <= 0 || $title === '' || $body === '') {
            return false;
        }

        if (Testimonial::query()->where('legacy_id', $legacyId)->exists()) {
            return LegacyImportOutcome::Skipped;
        }

        if (! $dryRun) {
            Testimonial::query()->create([
                'legacy_id' => $legacyId,
                'title' => $title,
                'author' => $this->signature($body),
                'body' => $body,
                'published_at' => $this->publishedAt((string) ($record['createdAt'] ?? ''), $title),
                'active' => true,
            ]);
        }

        return LegacyImportOutcome::Created;
    }

    private function signature(string $body): ?string
    {
        preg_match_all('/<p[^>]*>(.*?)<\/p>/is', $body, $matches);
        $last = trim((string) html_entity_decode(strip_tags((string) end($matches[1])), ENT_QUOTES | ENT_HTML5, 'UTF-8'));

        return $last !== '' && mb_strlen($last) <= self::SIGNATURE_MAX_LENGTH && ! preg_match('/[.!?]$/u', $last) ? $last : null;
    }

    /**
     * Some legacy entries carry a date in the future (e.g. 2030); those are dated by
     * the trip date in their title ("… 2023.01.28.") so they keep their place in time.
     */
    private function publishedAt(string $value, string $title): CarbonImmutable
    {
        $date = preg_match('/^\d{4}-\d{2}-\d{2}/', $value) ? CarbonImmutable::parse($value) : null;

        if ($date !== null && ! $date->isFuture()) {
            return $date;
        }

        return preg_match('/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})/', $title, $match)
            ? CarbonImmutable::create((int) $match[1], (int) $match[2], (int) $match[3])
            : CarbonImmutable::now();
    }
}
