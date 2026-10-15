<?php

namespace Tests\Unit;

use App\Services\Legacy\Catalog\LegacyTaxonomyResolver;
use Tests\TestCase;

class LegacyTaxonomyResolverTest extends TestCase
{
    public function test_only_the_configured_unambiguous_matches_are_linked(): void
    {
        $result = (new LegacyTaxonomyResolver)->resolve([
            'offer_groups' => ['Körutazás', 'AKCIÓS Utazások', 'Ismeretlen csoport'],
            'regions' => ['Svájc', 'Skandinávia', '2 napos belföldi utak', 'Foci EB 2024', 'Erdély'],
            'region_groups' => ['Advent', 'őszi szünet'],
        ]);

        $this->assertSame(['Körutazások', 'Adventi barangolások'], $result['categories']);
        $this->assertSame(['ch', 'no', 'hu', 'ro'], array_column($result['countries'], 'code'));
        $this->assertSame('romania', $result['countries'][3]['region_slug']);
        $this->assertSame([
            'offer_groups' => ['AKCIÓS Utazások', 'Ismeretlen csoport'],
            'regions' => ['Foci EB 2024'],
            'region_groups' => ['őszi szünet'],
        ], $result['unmapped']);
    }
}
