<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use App\Support\RichTextSanitizer;
use Database\Factories\TestimonialFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * A guest's letter or travel report about the agency ("Rólunk írták").
 */
class Testimonial extends Model
{
    /** @use HasFactory<TestimonialFactory> */
    use HasFactory, LogsModelActivity;

    private const EXCERPT_LENGTH = 260;

    protected $fillable = [
        'title',
        'author',
        'body',
        'published_at',
        'active',
        'legacy_id',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'active' => 'boolean',
        'legacy_id' => 'integer',
    ];

    protected static function booted(): void
    {
        static::saving(function (Testimonial $testimonial): void {
            $testimonial->body = (string) RichTextSanitizer::sanitize($testimonial->body);
        });
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('active', true)->where('published_at', '<=', now());
    }

    /**
     * The opening of the letter as plain text, without the short lines naming the
     * trip and its date ("Bosznia 2026.05.07.-10."), the greeting ("Kedves Bettina!", "Tisztelt Iroda!") and the signature.
     */
    public function excerpt(): string
    {
        $text = html_entity_decode(
            strip_tags((string) preg_replace('#<br\s*/?>|</p>#i', "\n", $this->body)),
            ENT_QUOTES | ENT_HTML5,
            'UTF-8',
        );

        $lines = collect(explode("\n", $text))
            ->map(fn (string $line): string => trim((string) preg_replace('/[\s\x{200B}]+/u', ' ', $line)))
            ->filter(fn (string $line): bool => $line !== '')
            ->reject(fn (string $line): bool => $this->isFramingLine($line))
            ->values();

        return Str::limit($lines->implode(' '), self::EXCERPT_LENGTH, '…', preserveWords: true);
    }

    private function isFramingLine(string $line): bool
    {
        $isShort = mb_strlen($line) <= 60;

        return $line === $this->author
            || ($isShort && preg_match('/\d{4}\.\s*\d{1,2}\./', $line) === 1)
            || ($isShort && preg_match('/^(kedves|tisztelt)\b/iu', $line) === 1);
    }
}
