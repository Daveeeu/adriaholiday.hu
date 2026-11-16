<?php

namespace App\Support;

use App\Services\Media\OptimizedImage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Who made a media library file and on what terms the site may use it: the
 * author, the copyright notice, where it came from (own photo, a stock
 * agency, a partner) and the licence.
 */
final class MediaRights
{
    public const FIELDS = ['author', 'copyright', 'origin', 'license'];

    /**
     * @return array<string, list<string>>
     */
    public static function rules(): array
    {
        return [
            'author' => ['nullable', 'string', 'max:255'],
            'copyright' => ['nullable', 'string', 'max:255'],
            'origin' => ['nullable', 'string', 'max:255'],
            'license' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * A new upload's rights: those typed in the admin win over the ones
     * embedded in the photo.
     *
     * @param  array<string, mixed>  $input
     */
    public static function fillForUpload(Media $media, OptimizedImage $image, array $input = []): void
    {
        foreach (self::FIELDS as $field) {
            $typed = trim((string) ($input[$field] ?? ''));
            $media->{$field} = $typed !== '' ? $typed : ($image->rights[$field] ?? null);
        }
    }

    /**
     * An edit's rights: only the fields sent change, an empty one clears it.
     *
     * @param  array<string, mixed>  $validated
     */
    public static function fillForUpdate(Media $media, array $validated): void
    {
        foreach (self::FIELDS as $field) {
            if (array_key_exists($field, $validated)) {
                $value = trim((string) $validated[$field]);
                $media->{$field} = $value !== '' ? $value : null;
            }
        }
    }
}
