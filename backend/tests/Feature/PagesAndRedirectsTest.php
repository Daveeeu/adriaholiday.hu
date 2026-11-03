<?php

namespace Tests\Feature;

use App\Models\Customer;
use App\Models\Page;
use App\Models\SeoRedirect;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PagesAndRedirectsTest extends TestCase
{
    use RefreshDatabase;

    private const MODULES = ['customers', 'pages', 'seo-redirects'];

    public function test_an_old_address_without_a_page_redirects_permanently_and_is_counted(): void
    {
        $redirect = SeoRedirect::factory()->create(['source_path' => 'apartman/villa-damiana---žminj', 'target' => '/utazasok']);

        $this->get('/apartman/villa-damiana---%C5%BEminj')->assertRedirect('/utazasok')->assertStatus(301);

        $this->assertSame(1, $redirect->refresh()->hits);
        $this->assertNotNull($redirect->last_hit_at);
    }

    public function test_a_redirect_never_hides_a_live_page_and_an_inactive_one_is_ignored(): void
    {
        SeoRedirect::factory()->create(['source_path' => 'kapcsolat', 'target' => '/utazasok']);
        SeoRedirect::factory()->create(['source_path' => 'regi-oldal', 'target' => '/utazasok', 'active' => false]);

        $this->get('/kapcsolat')->assertOk();
        $this->get('/regi-oldal')->assertNotFound();
    }

    public function test_a_published_page_is_served_at_its_address_with_its_own_head(): void
    {
        Page::factory()->create(['title' => 'Autóbuszaink', 'slug' => 'autobuszaink', 'seo_title' => 'Buszaink', 'content' => '<p>Modern buszok</p>']);
        Page::factory()->create(['slug' => 'rejtett', 'active' => false]);

        $this->assertStringContainsString('Buszaink', $this->get('/autobuszaink')->assertOk()->getContent());
        $this->get('/rejtett')->assertNotFound();

        $this->getJson('/api/portfolio/pages/autobuszaink')->assertOk()->assertJsonPath('title', 'Autóbuszaink')->assertJsonPath('content', '<p>Modern buszok</p>');
        $this->getJson('/api/portfolio/pages/rejtett')->assertNotFound();
    }

    public function test_admins_manage_pages_redirects_and_customers_only_with_permission(): void
    {
        $this->actingAsAdmin(['pages.viewAny']);

        $this->getJson('/api/admin/pages')->assertOk();
        $this->postJson('/api/admin/pages', ['title' => 'X', 'slug' => 'x'])->assertForbidden();
        $this->getJson('/api/admin/customers')->assertForbidden();
    }

    public function test_an_edited_redirect_becomes_the_offices_own(): void
    {
        $this->actingAsAdmin(['seo-redirects.viewAny', 'seo-redirects.view', 'seo-redirects.create', 'seo-redirects.update', 'seo-redirects.delete']);
        $redirect = SeoRedirect::factory()->create(['origin' => SeoRedirect::ORIGIN_LEGACY]);

        $this->patchJson("/api/admin/seo-redirects/{$redirect->id}", ['sourcePath' => '/Régi/Út/?x=1', 'target' => '/ajanlat/uj'])
            ->assertOk()
            ->assertJsonPath('data.sourcePath', '/Régi/Út')
            ->assertJsonPath('data.origin', SeoRedirect::ORIGIN_MANUAL);

        $this->postJson('/api/admin/seo-redirects', ['sourcePath' => 'a', 'target' => 'nem-cim'])->assertUnprocessable()->assertJsonValidationErrors('target');
    }

    public function test_pages_need_an_address_and_text_blocks_have_none(): void
    {
        $this->actingAsAdmin(['pages.viewAny', 'pages.view', 'pages.create', 'pages.update', 'pages.delete']);

        $this->postJson('/api/admin/pages', ['title' => 'Oldal', 'kind' => Page::KIND_PAGE])->assertUnprocessable()->assertJsonValidationErrors('slug');
        $this->postJson('/api/admin/pages', ['title' => 'Oldal', 'slug' => 'a/b'])->assertUnprocessable()->assertJsonValidationErrors('slug');

        $this->postJson('/api/admin/pages', ['title' => 'Blokk', 'kind' => Page::KIND_TEXT_BLOCK, 'slug' => 'blokk', 'content' => '<p>Szöveg</p>'])
            ->assertCreated()
            ->assertJsonPath('data.slug', null);
    }

    public function test_customers_are_listed_with_their_bookings_count(): void
    {
        $this->actingAsAdmin(['customers.viewAny', 'customers.view', 'customers.create', 'customers.update', 'customers.delete']);
        Customer::factory()->create(['name' => 'Pocsai Istvánné', 'email' => 'pocsai@example.com']);

        $this->getJson('/api/admin/customers?search=pocsai')
            ->assertOk()
            ->assertJsonPath('totalCount', 1)
            ->assertJsonPath('items.0.bookingsCount', 0);

        $this->postJson('/api/admin/customers', ['email' => 'POCSAI@example.com'])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    /**
     * @param  array<int, string>  $permissions
     */
    private function actingAsAdmin(array $permissions): void
    {
        foreach (self::MODULES as $module) {
            foreach (['viewAny', 'view', 'create', 'update', 'delete'] as $ability) {
                Permission::findOrCreate("{$module}.{$ability}", 'web');
            }
        }

        $role = Role::findOrCreate('Legacy Modules Test Admin', 'web');
        $role->syncPermissions($permissions);

        $user = User::factory()->create();
        $user->assignRole($role);

        Sanctum::actingAs($user);
    }
}
