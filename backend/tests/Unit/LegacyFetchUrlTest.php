<?php

namespace Tests\Unit;

use App\Support\Legacy\LegacyFetchUrl;
use Tests\TestCase;

class LegacyFetchUrlTest extends TestCase
{
    public function test_without_a_fetch_origin_the_legacy_url_is_fetched_as_it_is(): void
    {
        config(['services.legacy_adria.fetch_origin' => null]);

        $this->assertSame('https://adriaholiday.hu/files/a.jpg', LegacyFetchUrl::for('https://adriaholiday.hu/files/a.jpg'));
    }

    public function test_a_legacy_url_is_fetched_from_the_fetch_origin_with_its_path_and_query(): void
    {
        config(['services.legacy_adria.fetch_origin' => 'http://admin.adriaholiday.hu/']);

        $this->assertSame('http://admin.adriaholiday.hu/files/a%20b.jpg?x=1', LegacyFetchUrl::for('https://adriaholiday.hu/files/a%20b.jpg?x=1'));
        $this->assertSame('http://admin.adriaholiday.hu/uploads/gallery/1/a.jpg', LegacyFetchUrl::for('http://www.adriaholiday.hu/uploads/gallery/1/a.jpg'));
    }

    public function test_other_hosts_are_never_rewritten(): void
    {
        config(['services.legacy_adria.fetch_origin' => 'http://admin.adriaholiday.hu']);

        $this->assertSame('https://cdn.example.com/a.jpg', LegacyFetchUrl::for('https://cdn.example.com/a.jpg'));
        $this->assertSame('https://notadriaholiday.hu/a.jpg', LegacyFetchUrl::for('https://notadriaholiday.hu/a.jpg'));
    }
}
