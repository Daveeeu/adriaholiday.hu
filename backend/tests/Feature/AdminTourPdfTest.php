<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDeparturePlace;
use App\Models\User;
use App\Services\Tour\TourPdfService;
use App\Support\Tour\TourDateStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class AdminTourPdfTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_downloads_the_program_pdf_even_of_an_inactive_tour(): void
    {
        $tour = Tour::factory()->create(['active' => false, 'name' => 'Szlovéniai pillanatok', 'seo_name' => 'szloveniai-pillanatok']);
        $this->actingAsAdminWith(['tours.view']);

        $response = $this->get("/api/admin/tours/{$tour->id}/pdf");

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
        $this->assertStringContainsString('szloveniai-pillanatok-program.pdf', (string) $response->headers->get('content-disposition'));
        $this->assertStringStartsWith('%PDF-', $response->getContent());
    }

    public function test_the_program_lists_every_upcoming_date_and_drops_inline_fonts(): void
    {
        $tour = Tour::factory()->create([
            'program' => '<p><span style="font-family: Arial; font-size: 20px; color: #009900">1. nap: Kőszeg</span></p>',
            'prices' => '<p><span style="font-family: Times New Roman">Részvételi díj</span></p>',
        ]);
        TourDate::factory()->for($tour)->create(['start_date' => '2027-04-04', 'end_date' => '2027-04-10', 'price' => 248600]);
        TourDate::factory()->for($tour)->create(['start_date' => '2027-05-23', 'end_date' => '2027-05-29', 'price' => 248600, 'status' => TourDateStatus::SOLD_OUT]);
        TourDate::factory()->for($tour)->create(['start_date' => '2027-06-20', 'end_date' => '2027-06-26', 'status' => TourDateStatus::CANCELLED]);

        $html = app(TourPdfService::class)->html($tour);

        $this->assertStringContainsString('2027.04.04. - 04.10.', $html);
        $this->assertStringContainsString('2027.05.23. - 05.29.', $html);
        $this->assertStringContainsString('Betelt', $html);
        $this->assertStringNotContainsString('2027.06.20.', $html);
        $this->assertStringContainsString('1. nap: Kőszeg', $html);
        $this->assertStringContainsString('Részvételi díj', $html);
        $this->assertStringNotContainsString('font-family: Arial', $html);
        $this->assertStringNotContainsString('Times New Roman', $html);
        $this->assertStringNotContainsString('#009900', $html);
    }

    public function test_the_program_carries_everything_the_offer_page_shows(): void
    {
        $tour = Tour::factory()->create([
            'teaser' => '<p>Kedvcsináló szöveg</p>',
            'tickets' => '<p>Belépők ára</p>',
            'notes' => '<p>Egyéb tudnivaló</p>',
            'optional_programs' => '<p>Fakultatív hajókirándulás</p>',
            'inclusions' => '<p>Útiokmány: személyi igazolvány</p>',
            'catering' => 'reggeli',
            'accommodation' => 'Hotel***',
        ]);
        $budapest = TourDeparturePlace::factory()->create(['name' => 'Budapest', 'active' => true, 'fee' => 0]);
        $szeged = TourDeparturePlace::factory()->create(['name' => 'Szeged', 'active' => true, 'fee' => 3000]);
        $closed = TourDeparturePlace::factory()->create(['name' => 'Bezárt hely', 'active' => false]);
        $tour->departurePlaces()->attach([$budapest->id => ['fee' => null], $szeged->id => ['fee' => null], $closed->id => ['fee' => null]]);

        $html = app(TourPdfService::class)->html($tour);

        foreach (['Kedvcsináló szöveg', 'Belépők ára', 'Egyéb tudnivaló', 'Fakultatív hajókirándulás', 'Útiokmány: személyi igazolvány', 'Reggeli', 'Hotel***', 'Felszállási lehetőségek', 'Budapest', 'Szeged <span class="fee">(+3.000 Ft/fő)</span>'] as $text) {
            $this->assertStringContainsString($text, $html);
        }
        $this->assertStringNotContainsString('Bezárt hely', $html);
    }

    public function test_the_legacy_meta_kept_in_the_notes_is_no_note(): void
    {
        $tour = Tour::factory()->create(['notes' => '{"transport":"bus"}']);

        $this->assertStringNotContainsString('Jegyzet / egyéb', app(TourPdfService::class)->html($tour));
    }

    public function test_the_pdf_needs_the_tour_view_permission(): void
    {
        $tour = Tour::factory()->create();
        $this->actingAsAdminWith(['tours.viewAny']);

        $this->getJson("/api/admin/tours/{$tour->id}/pdf")->assertForbidden();
    }

    /**
     * @param  array<int, string>  $permissions
     */
    private function actingAsAdminWith(array $permissions): void
    {
        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $role = Role::findOrCreate('Tour PDF Test', 'web');
        $role->syncPermissions($permissions);
        $user = User::factory()->create();
        $user->assignRole($role);

        Sanctum::actingAs($user);
    }
}
