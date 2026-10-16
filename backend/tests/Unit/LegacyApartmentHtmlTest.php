<?php

namespace Tests\Unit;

use App\Support\Legacy\Apartments\LegacyApartmentHtml;
use App\Support\RichTextSanitizer;
use PHPUnit\Framework\TestCase;

class LegacyApartmentHtmlTest extends TestCase
{
    public function test_links_to_legacy_site_pages_become_site_relative(): void
    {
        $html = LegacyApartmentHtml::prepare('<p><a href="apartmanok/veneto/bibione#strand_bibione">Strand</a> <a href="http://adriaholiday.hu/kapcsolat">Kapcsolat</a> <a href="https://www.bibione.com">Bibione</a> <a href="#sport">Sport</a></p>');

        $this->assertSame('<p><a href="/apartmanok/veneto/bibione#strand_bibione">Strand</a> <a href="/kapcsolat">Kapcsolat</a> <a href="https://www.bibione.com">Bibione</a> <a href="#sport">Sport</a></p>', $html);
    }

    public function test_a_field_without_text_is_none(): void
    {
        $this->assertNull(LegacyApartmentHtml::prepare('<p>&nbsp;</p>'));
        $this->assertNull(LegacyApartmentHtml::prepare(null));
    }

    public function test_headings_and_anchors_keep_a_plain_id_as_the_target_of_in_page_links(): void
    {
        $this->assertSame(
            '<h2><a id="udules_bibione">Üdülés</a></h2><h3 id="sport">Sport</h3><p>x</p>',
            RichTextSanitizer::sanitize('<h2><a id="udules_bibione" name="udules_bibione">Üdülés</a></h2><h3 id="sport">Sport</h3><p id="p1">x</p>'),
        );
        $this->assertSame('<h2>Rossz</h2>', RichTextSanitizer::sanitize('<h2 id="x&quot; onclick=&quot;a">Rossz</h2>'));
    }
}
