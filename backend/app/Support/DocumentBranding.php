<?php

namespace App\Support;

use App\Models\SiteSetting;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Brand details (logo and contact data) for generated documents such as the tour program PDF,
 * taken from the admin-managed site settings so documents follow the live branding.
 */
final class DocumentBranding
{
    private const EMBEDDABLE_LOGO_MIME_TYPES = ['image/png', 'image/jpeg'];

    /**
     * @return array{siteName: string, logoDataUri: ?string, phone: ?string, email: ?string}
     */
    public static function resolve(): array
    {
        $settings = SiteSetting::query()
            ->whereIn('group', ['general', 'brand', 'contact'])
            ->get()
            ->mapWithKeys(fn (SiteSetting $setting): array => [
                "{$setting->group}.{$setting->key}" => $setting->decodedValue(),
            ]);

        return [
            'siteName' => self::stringOrNull($settings->get('general.site_name')) ?? config('app.name'),
            'logoDataUri' => self::logoDataUri($settings->get('brand.logo')),
            'phone' => self::stringOrNull($settings->get('contact.phone')),
            'email' => self::stringOrNull($settings->get('contact.email')),
        ];
    }

    /**
     * Documents embed the logo inline because the PDF renderer does not load remote assets.
     */
    private static function logoDataUri(mixed $logo): ?string
    {
        $mediaId = is_array($logo) ? ($logo['id'] ?? null) : null;

        if (! is_numeric($mediaId)) {
            return null;
        }

        $media = Media::query()->find((int) $mediaId);

        if (! $media || ! in_array($media->mime_type, self::EMBEDDABLE_LOGO_MIME_TYPES, true)) {
            return null;
        }

        $path = $media->getPath();

        if (! is_file($path) || ! is_readable($path)) {
            return null;
        }

        return 'data:'.$media->mime_type.';base64,'.base64_encode((string) file_get_contents($path));
    }

    private static function stringOrNull(mixed $value): ?string
    {
        return is_string($value) && trim($value) !== '' ? trim($value) : null;
    }
}
