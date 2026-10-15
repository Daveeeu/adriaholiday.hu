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

    public function test_an_offer_without_regions_takes_its_xml_destination_only_when_it_names_a_country(): void
    {
        $resolver = new LegacyTaxonomyResolver;
        $resolve = fn (array $regions, ?string $xmlCity): array => $resolver->resolve(['offer_groups' => [], 'regions' => $regions, 'region_groups' => [], 'xml_city' => $xmlCity]);

        $this->assertSame([['ro', 'xml_city']], [[$resolve([], 'Erdély')['countries'][0]['code'], $resolve([], 'Erdély')['country_source']]]);
        $this->assertSame([], $resolve([], 'Szeged')['countries']);
        $this->assertNull($resolve([], 'Szeged')['country_source']);
        // The regions win over the XML destination.
        $this->assertSame(['at'], array_column($resolve(['Ausztria'], 'Horvátország')['countries'], 'code'));
        $this->assertSame('regions', $resolve(['Ausztria'], 'Horvátország')['country_source']);
    }
}
