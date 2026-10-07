<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\User;
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
