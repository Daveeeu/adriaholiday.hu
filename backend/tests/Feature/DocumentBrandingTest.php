<?php

namespace Tests\Feature;

use App\Models\AdminMediaItem;
use App\Models\SiteSetting;
use App\Support\DocumentBranding;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentBrandingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake(config('media-library.disk_name'));
    }

    public function test_it_embeds_the_configured_brand_logo_and_contact_details(): void
    {
        $media = AdminMediaItem::create()
            ->addMedia(UploadedFile::fake()->image('logo.png', 320, 90))
            ->toMediaCollection('library');

        $this->setting('brand', 'logo', 'media', SiteSetting::encodeValue('media', ['id' => $media->id]));
        $this->setting('general', 'site_name', 'string', 'Adria Holiday');
        $this->setting('contact', 'phone', 'string', '+36 1 234 5678');
        $this->setting('contact', 'phones', 'text', null);
        $this->setting('contact', 'email', 'string', 'info@adriaholiday.hu');

        $branding = DocumentBranding::resolve();

        $this->assertStringStartsWith('data:image/png;base64,', (string) $branding['logoDataUri']);
        $this->assertSame('Adria Holiday', $branding['siteName']);
        $this->assertSame(['+36 1 234 5678'], $branding['phones']);
        $this->assertSame('info@adriaholiday.hu', $branding['email']);
    }

    public function test_it_lists_every_office_phone_number(): void
    {
        $this->setting('contact', 'phone', 'string', '+36 1 234 5678');
        $this->setting('contact', 'phones', 'text', "+36 1 234 5678\n\n +36 30 111 2222 \n+36 1 234 5678");

        $this->assertSame(['+36 1 234 5678', '+36 30 111 2222'], DocumentBranding::resolve()['phones']);
    }

    public function test_it_falls_back_to_the_app_name_without_logo_or_settings(): void
    {
        SiteSetting::query()->delete();

        $branding = DocumentBranding::resolve();

        $this->assertNull($branding['logoDataUri']);
        $this->assertSame(config('app.name'), $branding['siteName']);
        $this->assertSame([], $branding['phones']);
        $this->assertNull($branding['email']);
    }

    public function test_it_ignores_a_logo_pointing_to_missing_media(): void
    {
        $this->setting('brand', 'logo', 'media', SiteSetting::encodeValue('media', ['id' => 999999]));

        $this->assertNull(DocumentBranding::resolve()['logoDataUri']);
    }

    private function setting(string $group, string $key, string $type, ?string $value): void
    {
        SiteSetting::query()->updateOrCreate(
            ['group' => $group, 'key' => $key],
            ['type' => $type, 'is_public' => true, 'value' => $value],
        );
    }
}
