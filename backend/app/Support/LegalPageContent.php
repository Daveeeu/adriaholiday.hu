<?php

namespace App\Support;

/**
 * Default rich text of the public legal and contact pages, taken over from the
 * legacy adriaholiday.hu site. The HTML lives in database/content/legal so the
 * seeder and the data migration of existing installs share one source.
 */
final class LegalPageContent
{
    public const GROUP = 'legal';

    public const TYPE = 'richtext';

    /**
     * @var array<string, string> setting key => file name in database/content/legal
     */
    public const FILES = [
        'contact_content' => 'contact.html',
        'imprint_content' => 'imprint.html',
        'privacy_content' => 'privacy.html',
        'terms_content' => 'terms.html',
        'cookie_content' => 'cookie.html',
    ];

    /**
     * @return array<string, string> setting key => HTML
     */
    public static function defaults(): array
    {
        return array_map(
            fn (string $file): string => trim((string) file_get_contents(database_path("content/legal/{$file}"))),
            self::FILES,
        );
    }
}
