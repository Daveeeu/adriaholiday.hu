<?php

namespace Tests\Feature;

use App\Models\SiteSetting;
use App\Support\Booking\BookingPaymentSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BarionPixelTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_pages_carry_the_base_barion_pixel_in_the_head(): void
    {
        $this->setPixelId('BP-h0u2v3lcwu-A3');

        $html = $this->get('/kapcsolat')->assertOk()->getContent();

        $this->assertStringContainsString('window["barion_pixel_id"] = "BP-h0u2v3lcwu-A3";', $html);
        $this->assertStringContainsString('https://pixel.barion.com/bp.js', $html);
        $this->assertLessThan(strpos($html, '</head>'), strpos($html, 'barion_pixel_id'));
    }

    public function test_no_pixel_is_added_without_a_valid_pixel_id(): void
    {
        $this->assertStringNotContainsString('pixel.barion.com', $this->get('/')->assertOk()->getContent());

        $this->setPixelId('BP-"><script>alert(1)</script>');

        $this->assertStringNotContainsString('pixel.barion.com', $this->get('/')->assertOk()->getContent());
    }

    public function test_api_paths_are_not_served_the_spa(): void
    {
        $this->get('/api/unknown')->assertNotFound();
    }

    private function setPixelId(string $id): void
    {
        SiteSetting::query()->updateOrCreate(
            ['group' => BookingPaymentSettings::GROUP, 'key' => 'barion_pixel_id'],
            ['type' => 'string', 'is_public' => true, 'value' => $id],
        );
    }
}
