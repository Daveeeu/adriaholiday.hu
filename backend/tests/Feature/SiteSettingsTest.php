<?php

namespace Tests\Feature;

use App\Models\AdminMediaItem;
use App\Models\SiteSetting;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Database\Seeders\SiteSettingsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class SiteSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            RolePermissionSeeder::class,
            SiteSettingsSeeder::class,
        ]);
    }

    public function test_public_site_settings_endpoint_returns_only_public_items(): void
    {
        $response = $this->getJson('/api/portfolio/site-settings')
            ->assertOk()
            ->json();

        $this->assertSame('Adria Holiday', $response['general']['site_name'] ?? null);
        $this->assertSame('/kapcsolat', $response['cta']['primary_link'] ?? null);
        $this->assertArrayNotHasKey('analytics', $response);
    }

    public function test_media_settings_serve_the_current_urls_of_the_stored_media_item(): void
    {
        Storage::fake(config('media-library.disk_name'));
        $media = AdminMediaItem::create()
            ->addMedia(UploadedFile::fake()->image('logo.png', 320, 90))
            ->toMediaCollection('library');

        // Saved on another host, e.g. a local install whose data was moved to production.
        SiteSetting::query()->where('group', 'brand')->where('key', 'logo')->update([
            'value' => SiteSetting::encodeValue('media', [
                'id' => $media->id,
                'url' => 'http://adriaholiday.lan/storage/'.$media->id.'/logo.png',
            ]),
        ]);
        SiteSetting::query()->where('group', 'seo')->where('key', 'default_og_image')->update([
            'value' => SiteSetting::encodeValue('media', ['id' => 999999, 'url' => 'http://adriaholiday.lan/missing.png']),
        ]);

        $response = $this->getJson('/api/portfolio/site-settings')->assertOk();

        $response->assertJsonPath('brand.logo.id', $media->id)
            ->assertJsonPath('brand.logo.url', $media->getUrl())
            ->assertJsonPath('seo.default_og_image', null);
        $this->assertStringNotContainsString('adriaholiday.lan', $response->content());
    }

    public function test_private_setting_does_not_leak_to_public_endpoint(): void
    {
        $response = $this->getJson('/api/portfolio/site-settings')
            ->assertOk()
            ->json();

        $this->assertFalse(isset($response['analytics']['meta_pixel_id']));
        $this->assertFalse(isset($response['analytics']['meta_pixel_enabled']));
    }

    public function test_public_endpoint_serves_company_contact_and_legal_pages(): void
    {
        $response = $this->getJson('/api/portfolio/site-settings')->assertOk();

        $response->assertJsonPath('contact.phone', '+36 46 508 688')
            ->assertJsonPath('contact.email', 'adriaholiday@adriaholiday.hu')
            ->assertJsonPath('contact.opening_hours', "Hétfő–Péntek: 08:00–16:00\nSzombat–Vasárnap: zárva");

        $this->assertStringContainsString('Cégjegyzékszám:</strong> 01-09-433588', $response->json('legal.imprint_content'));
        $this->assertStringContainsString('<h2>Utazási szerződéshez kapcsolódó tájékoztató</h2>', $response->json('legal.terms_content'));
        $this->assertStringContainsString('<h2>Adatbiztonság</h2>', $response->json('legal.privacy_content'));
    }

    public function test_public_site_settings_list_the_agency_social_profiles(): void
    {
        $this->getJson('/api/portfolio/site-settings')
            ->assertOk()
            ->assertJsonPath('social.facebook', 'https://www.facebook.com/adriaholiday')
            ->assertJsonPath('social.instagram', 'https://www.instagram.com/adriaholidayutazasok/')
            ->assertJsonPath('social.tiktok', 'https://www.tiktok.com/@adria.holiday');
    }

    public function test_admin_social_links_must_be_web_addresses(): void
    {
        Sanctum::actingAs($this->siteSettingsAdmin());

        $this->putJson('/api/admin/site-settings', [
            'items' => [
                ['group' => 'social', 'key' => 'tiktok', 'type' => 'string', 'isPublic' => true, 'value' => 'javascript:alert(1)'],
            ],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('items.0.value');

        $this->putJson('/api/admin/site-settings', [
            'items' => [
                ['group' => 'social', 'key' => 'tiktok', 'type' => 'string', 'isPublic' => true, 'value' => 'https://www.tiktok.com/@adria.holiday'],
                ['group' => 'social', 'key' => 'instagram', 'type' => 'string', 'isPublic' => true, 'value' => ''],
            ],
        ])->assertOk();
    }

    public function test_admin_rich_text_setting_is_sanitized(): void
    {
        Sanctum::actingAs($this->siteSettingsAdmin());

        $this->putJson('/api/admin/site-settings', [
            'items' => [
                [
                    'group' => 'legal',
                    'key' => 'terms_content',
                    'type' => 'richtext',
                    'isPublic' => true,
                    'value' => '<h2>Feltételek</h2><p onclick="alert(1)">Szöveg</p><script>alert(1)</script>',
                ],
            ],
        ])->assertOk();

        $this->getJson('/api/portfolio/site-settings')
            ->assertOk()
            ->assertJsonPath('legal.terms_content', '<h2>Feltételek</h2><p>Szöveg</p>');
    }

    public function test_admin_update_site_settings_works(): void
    {
        Sanctum::actingAs($this->siteSettingsAdmin());

        $response = $this->putJson('/api/admin/site-settings', [
            'items' => [
                [
                    'group' => 'general',
                    'key' => 'site_name',
                    'type' => 'string',
                    'isPublic' => true,
                    'value' => 'Új Adria Holiday',
                ],
                [
                    'group' => 'analytics',
                    'key' => 'meta_pixel_enabled',
                    'type' => 'boolean',
                    'isPublic' => false,
                    'value' => true,
                ],
            ],
        ]);

        $response->assertOk()
            ->assertJsonFragment([
                'group' => 'general',
                'key' => 'site_name',
                'value' => 'Új Adria Holiday',
            ])
            ->assertJsonFragment([
                'group' => 'analytics',
                'key' => 'meta_pixel_enabled',
                'value' => true,
            ]);

        $this->getJson('/api/portfolio/site-settings')
            ->assertOk()
            ->assertJsonPath('general.site_name', 'Új Adria Holiday')
            ->assertJsonMissingPath('analytics');
    }

    private function siteSettingsAdmin(): User
    {
        Permission::findOrCreate('site-settings.view', 'web');
        Permission::findOrCreate('site-settings.update', 'web');

        $role = Role::findOrCreate('Site Settings Admin', 'web');
        $role->syncPermissions(['site-settings.view', 'site-settings.update']);

        $user = User::factory()->create([
            'email' => 'site-settings-admin@example.com',
        ]);
        $user->assignRole($role);

        return $user;
    }
}
