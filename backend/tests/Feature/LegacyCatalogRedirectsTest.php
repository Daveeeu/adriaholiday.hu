<?php

namespace Tests\Feature;

use App\Models\Apartment;
use App\Models\Location;
use App\Models\Region;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LegacyCatalogRedirectsTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_country_listings_lead_to_the_region_page_in_one_redirect(): void
    {
        Region::factory()->create(['slug' => 'croatia', 'country_code' => 'HR']);
        Region::factory()->create(['slug' => 'montenegro', 'country_code' => 'ME']);
        Region::factory()->create(['slug' => 'lengyelorszag', 'country_code' => 'PL']);
        Region::factory()->create(['slug' => 'szlovakia-regi', 'country_code' => 'SK', 'is_active' => false]);

        $redirects = [
            '/korutazasok/regio/horvatorszag' => '/regiok/croatia',
            '/korutazasok/regio/lengyelorszag' => '/regiok/lengyelorszag',
            '/korutazasok/regio/Montenegr%C3%B3' => '/regiok/montenegro',
            '/korutazasok/csoport/korutazas/montenegro' => '/regiok/montenegro',
            '/korutazasok/csoport/tengerparti-udulesek/montenegro' => '/regiok/montenegro',
            '/korutazasok/csoport/tengerparti-udulesek/montenegro/regi-lap' => '/regiok/montenegro',
            '/egyeni-szallasfoglalas/horvatorszag' => '/regiok/croatia',
            '/egyeni-szallasfoglalas/horvatorszag/pula' => '/regiok/croatia',
            '/egyeni-szallasfoglalas/horvatorszag/rovinj' => '/regiok/croatia',
        ];

        foreach ($redirects as $from => $to) {
            $this->get($from)->assertStatus(301)->assertRedirect($to);
        }
    }

    public function test_a_legacy_accommodation_page_leads_to_its_places_apartments_while_they_have_a_page(): void
    {
        Region::factory()->create(['slug' => 'croatia', 'country_code' => 'HR']);
        $rovinj = Location::factory()->create(['area_slug' => 'croatia', 'slug' => 'rovinj']);
        Apartment::factory()->create(['location_id' => $rovinj->id]);
        Location::factory()->create(['area_slug' => 'croatia', 'slug' => 'pula']);

        $this->get('/egyeni-szallasfoglalas/horvatorszag/rovinj')->assertStatus(301)->assertRedirect('/apartmanok/croatia/rovinj');
        $this->get('/egyeni-szallasfoglalas/horvatorszag/pula')->assertStatus(301)->assertRedirect('/regiok/croatia');
    }

    public function test_listings_without_a_live_region_keep_their_category_or_all_trips(): void
    {
        Region::factory()->create(['slug' => 'austria', 'country_code' => 'AT']);
        Region::factory()->create(['slug' => 'szlovakia-regi', 'country_code' => 'SK', 'is_active' => false]);

        $redirects = [
            // An advent listing stays on the advent category even where the country has a page.
            '/korutazasok/csoport/advent/ausztria' => '/kategoriak/adventi-barangolasok',
            '/korutazasok/csoport/korutazas/skocia' => '/kategoriak/korutazasok',
            '/korutazasok/csoport/osztalykirandulasok/hatartalanul' => '/utazasok',
            '/korutazasok/regio/Szlov%C3%A1kia' => '/utazasok',
            '/korutazasok/regio/havas-kalandok' => '/kategoriak/havas-kalandok',
            '/egyeni-szallasfoglalas/bulgaria/napospart' => '/utazasok',
        ];

        foreach ($redirects as $from => $to) {
            $this->get($from)->assertStatus(301)->assertRedirect($to);
        }
    }
}
