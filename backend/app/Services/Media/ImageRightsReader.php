<?php

namespace App\Services\Media;

use Illuminate\Support\Str;

/**
 * Reads the author, copyright notice and origin a photographer or stock
 * agency embedded in a JPEG (IPTC, then EXIF), before the web conversion
 * drops the file's metadata.
 */
class ImageRightsReader
{
    /** IPTC datasets, in order of preference per field. */
    private const IPTC = [
        'author' => ['2#080'],          // By-line
        'copyright' => ['2#116'],       // Copyright Notice
        'origin' => ['2#115', '2#110'], // Source, Credit
    ];

    private const EXIF = [
        'author' => 'Artist',
        'copyright' => 'Copyright',
    ];

    private const MAX_LENGTH = 255;

    /**
     * @return array{author?: string, copyright?: string, origin?: string}
     */
    public function read(string $path): array
    {
        $iptc = $this->iptc($path);
        $exif = $this->exif($path);
        $rights = [];

        foreach (self::IPTC as $field => $datasets) {
            $value = collect($datasets)
                ->map(fn (string $dataset): ?string => $this->clean($iptc[$dataset][0] ?? null))
                ->first(fn (?string $value): bool => $value !== null)
                ?? $this->clean($exif[self::EXIF[$field] ?? ''] ?? null);

            if ($value !== null) {
                $rights[$field] = $value;
            }
        }

        return $rights;
    }

    /**
     * @return array<string, list<string>>
     */
    private function iptc(string $path): array
    {
        $info = [];

        if (@getimagesize($path, $info) === false || ! isset($info['APP13'])) {
            return [];
        }

        return iptcparse($info['APP13']) ?: [];
    }

    /**
     * @return array<string, mixed>
     */
    private function exif(string $path): array
    {
        if (! function_exists('exif_read_data') || @exif_imagetype($path) !== IMAGETYPE_JPEG) {
            return [];
        }

        return @exif_read_data($path, 'IFD0') ?: [];
    }

    private function clean(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        // Older tools write IPTC in Windows-1252 rather than UTF-8.
        if (! mb_check_encoding($value, 'UTF-8')) {
            $value = mb_convert_encoding($value, 'UTF-8', 'Windows-1252');
        }

        $value = trim((string) preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value));

        return $value !== '' ? Str::limit($value, self::MAX_LENGTH, '') : null;
    }
}
