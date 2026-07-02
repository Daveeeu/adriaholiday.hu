<?php

namespace App\Models;

use App\Models\Concerns\LogsModelActivity;
use App\Support\MediaCategory;
use Database\Factories\PortfolioContentBlockFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Image\Enums\Fit;

class PortfolioContentBlock extends Model implements HasMedia
{
    /** @use HasFactory<PortfolioContentBlockFactory> */
    use HasFactory, InteractsWithMedia, LogsModelActivity, SoftDeletes;

    public const HERO_IMAGE_KEY = 'home.hero.image';

    public const HERO_VIDEO_KEY = 'home.hero.video';

    public const MEDIA_FIELD_KEYS = [
        self::HERO_IMAGE_KEY,
        self::HERO_VIDEO_KEY,
        'home.brand.logo',
        'home.experience.image',
        'home.experience.quote.image',
        'home.story.image',
        'home.trust.review.1.image',
        'home.trust.review.2.image',
        'home.trust.review.3.image',
        'home.trust.review.4.image',
    ];

    protected $fillable = [
        'key',
        'page',
        'section',
        'label',
        'type',
        'locale',
        'value',
        'value_json',
        'draft_value',
        'draft_value_json',
        'is_published',
        'updated_by',
    ];

    protected $casts = [
        'value_json' => 'array',
        'draft_value_json' => 'array',
        'is_published' => 'boolean',
        'updated_by' => 'integer',
    ];

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function registerMediaCollections(): void
    {
        foreach ([$this->draftMediaCollectionName(), $this->publishedMediaCollectionName()] as $collectionName) {
            if ($collectionName === null) {
                continue;
            }

            $this->addMediaCollection($collectionName)->singleFile()->useDisk(config('media-library.disk_name'));
        }
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        if ($media && is_string($media->mime_type) && str_starts_with($media->mime_type, 'video/')) {
            return;
        }

        $this->addMediaConversion('thumbnail')
            ->fit(Fit::Crop, 480, 320)
            ->nonQueued();

        $this->addMediaConversion('preview')
            ->fit(Fit::Crop, 1280, 720)
            ->nonQueued();

        $this->addMediaConversion('large')
            ->fit(Fit::Crop, 1920, 1080)
            ->nonQueued();
    }

    public function scopeForPage($query, string $page)
    {
        return $query->where('page', $page);
    }

    public function isMediaField(): bool
    {
        return in_array($this->key, self::MEDIA_FIELD_KEYS, true);
    }

    public function mediaCollectionName(bool $draft = false): ?string
    {
        if (! $this->isMediaField()) {
            return null;
        }

        return $draft ? "{$this->key}.draft" : "{$this->key}.published";
    }

    public function draftMediaCollectionName(): ?string
    {
        return $this->mediaCollectionName(true);
    }

    public function publishedMediaCollectionName(): ?string
    {
        return $this->mediaCollectionName(false);
    }

    public function mediaPayload(bool $draft = false): ?array
    {
        $collectionName = $this->mediaCollectionName($draft);
        if ($collectionName === null) {
            return null;
        }

        $media = $this->getFirstMedia($collectionName);
        $metadata = $this->mediaMetadata($draft);

        if (! $media) {
            $legacyUrl = $this->legacyMediaUrl($draft);

            if ($legacyUrl === null) {
                return null;
            }

            return array_filter([
                'url' => $legacyUrl,
                'thumbnailUrl' => $legacyUrl,
                'name' => $metadata['title'] ?? null,
                'fileName' => basename(parse_url($legacyUrl, PHP_URL_PATH) ?: $legacyUrl),
                'size' => null,
                'mimeType' => $metadata['mimeType'] ?? null,
                'alt' => $metadata['alt'] ?? null,
                'title' => $metadata['title'] ?? null,
            ], static fn ($value) => $value !== null && $value !== '');
        }

        return array_filter([
            'id' => $media->id,
            'url' => $media->getUrl(),
            'thumbnailUrl' => $this->mediaThumbnailUrl($media),
            'sizes' => $this->mediaSizes($media),
            'name' => $media->name,
            'fileName' => $media->file_name,
            'size' => (int) ($media->size ?? 0),
            'mimeType' => $media->mime_type,
            'category' => MediaCategory::normalized($media->category ?? data_get($media->custom_properties, 'category')),
            'categoryLabel' => MediaCategory::labelFor($media->category ?? data_get($media->custom_properties, 'category')),
            'sourceContext' => $media->source_context ?? data_get($media->custom_properties, 'source_context'),
            'sourceId' => $media->source_id ?? data_get($media->custom_properties, 'source_id'),
            'alt' => $metadata['alt'] ?? null,
            'title' => $metadata['title'] ?? null,
            'createdAt' => $media->created_at?->toISOString(),
        ], static fn ($value) => $value !== null && $value !== '');
    }

    public function hasDraftMedia(): bool
    {
        $collectionName = $this->draftMediaCollectionName();

        return $collectionName !== null && $this->hasMedia($collectionName);
    }

    public function publishDraftMedia(): void
    {
        $draftCollection = $this->draftMediaCollectionName();
        $publishedCollection = $this->publishedMediaCollectionName();

        if ($draftCollection === null || $publishedCollection === null) {
            return;
        }

        $draftMedia = $this->getFirstMedia($draftCollection);
        $this->clearMediaCollection($publishedCollection);

        if ($draftMedia) {
            $draftMedia->copy($this, $publishedCollection);
        }

        $this->clearMediaCollection($draftCollection);
    }

    public function clearDraftMedia(): void
    {
        $collectionName = $this->draftMediaCollectionName();

        if ($collectionName === null) {
            return;
        }

        $this->clearMediaCollection($collectionName);
    }

    public function updateDraftMediaMetadata(array $metadata): void
    {
        $current = $this->draft_value_json;

        if (! is_array($current)) {
            $current = $this->value_json;
        }

        if (! is_array($current)) {
            $current = [];
        }

        $this->forceFill([
            'draft_value_json' => array_merge($current, array_filter($metadata, static fn ($value) => $value !== null && $value !== '')) ?: null,
        ])->save();
    }

    public function mediaThumbnailUrl(Media $media): string
    {
        try {
            return $media->getUrl('thumbnail');
        } catch (\Throwable) {
            return $media->getUrl();
        }
    }

    public function mediaSizes(Media $media): array
    {
        $sizes = [
            'thumbnail' => null,
            'preview' => null,
            'large' => null,
            'original' => $media->getUrl(),
        ];

        foreach (['thumbnail', 'preview', 'large'] as $conversion) {
            try {
                $sizes[$conversion] = $media->getUrl($conversion);
            } catch (\Throwable) {
                $sizes[$conversion] = $media->getUrl();
            }
        }

        return array_filter($sizes, static fn ($value) => is_string($value) && $value !== '');
    }

    private function mediaMetadata(bool $draft = false): array
    {
        $metadata = $draft ? $this->draft_value_json : $this->value_json;

        return is_array($metadata) ? $metadata : [];
    }

    private function legacyMediaUrl(bool $draft = false): ?string
    {
        $value = $draft ? ($this->draft_value ?? $this->value) : $this->value;
        if (is_string($value) && $value !== '') {
            return $value;
        }

        $metadata = $this->mediaMetadata($draft);
        $url = $metadata['url'] ?? null;

        return is_string($url) && $url !== '' ? $url : null;
    }

    public function publishedValue(): mixed
    {
        return match ($this->type) {
            'image', 'video' => $this->mediaPayload(false),
            'button', 'list', 'json' => $this->value_json,
            default => $this->value,
        };
    }

    public function draftValue(): mixed
    {
        return match ($this->type) {
            'image', 'video' => $this->mediaPayload(true) ?? $this->mediaPayload(false),
            'button', 'list', 'json' => $this->draft_value_json ?? $this->value_json,
            default => $this->draft_value ?? $this->value,
        };
    }
}
