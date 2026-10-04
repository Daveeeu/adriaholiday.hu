<?php

namespace Tests\Unit;

use App\Support\RichTextSanitizer;
use PHPUnit\Framework\TestCase;

class RichTextSanitizerTest extends TestCase
{
    public function test_it_removes_script_tags_and_event_handlers(): void
    {
        $input = '<p>Szöveg</p><script>alert(1)</script><img src="x" onerror="alert(1)">';

        $sanitized = RichTextSanitizer::sanitize($input);

        $this->assertSame('<p>Szöveg</p>', $sanitized);
    }

    public function test_it_keeps_allowed_formatting(): void
    {
        $input = '<p><strong>kiemelt</strong> <em>dőlt</em> <a href="https://example.com" target="_blank" onclick="alert(1)">link</a></p>';

        $sanitized = RichTextSanitizer::sanitize($input);

        $this->assertSame('<p><strong>kiemelt</strong> <em>dőlt</em> <a href="https://example.com" target="_blank">link</a></p>', $sanitized);
    }

    public function test_it_keeps_phone_links_and_drops_malformed_ones(): void
    {
        $input = '<p><a href="tel:+3646508688">+36 46 508 688</a> <a href="tel:alert(1)">rossz</a></p>';

        $sanitized = RichTextSanitizer::sanitize($input);

        $this->assertSame('<p><a href="tel:+3646508688">+36 46 508 688</a> <a>rossz</a></p>', $sanitized);
    }
}
