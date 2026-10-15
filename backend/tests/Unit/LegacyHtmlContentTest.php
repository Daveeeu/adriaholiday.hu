<?php

namespace Tests\Unit;

use App\Support\Legacy\LegacyHtmlContent;
use PHPUnit\Framework\TestCase;

class LegacyHtmlContentTest extends TestCase
{
    public function test_images_point_to_their_copy_and_the_html_is_sanitized(): void
    {
        $html = LegacyHtmlContent::prepare(
            '<p><b>Kuba</b><img src="files/Kuba/a%20b.jpg" alt="A"><img src="https://c.ccdn.hu/1/x.jpg"></p><script>x()</script>',
            'https://adriaholiday.hu',
            fn (string $url): ?string => $url === 'https://adriaholiday.hu/files/Kuba/a%20b.jpg' ? '/storage/5/a%20b.jpg' : null,
        );

        $this->assertSame('<p><strong>Kuba</strong><img src="/storage/5/a%20b.jpg" alt="A" loading="lazy"><img src="https://c.ccdn.hu/1/x.jpg" alt="" loading="lazy"></p>', $html);
    }

    public function test_empty_html_is_none(): void
    {
        $this->assertNull(LegacyHtmlContent::prepare('<p>&nbsp;</p>', 'https://adriaholiday.hu', fn (): ?string => null));
        $this->assertNull(LegacyHtmlContent::prepare(null, 'https://adriaholiday.hu', fn (): ?string => null));
    }

    public function test_image_urls_are_absolute(): void
    {
        $this->assertSame(
            ['https://adriaholiday.hu/files/a.jpg', 'https://example.com/b.jpg', 'https://cdn.example.com/c.jpg'],
            LegacyHtmlContent::imageUrls('<img src="/files/a.jpg"><img src=\'https://example.com/b.jpg\'><img src="//cdn.example.com/c.jpg"><img src="data:image/png;base64,AA">', 'https://adriaholiday.hu/'),
        );
    }
}
