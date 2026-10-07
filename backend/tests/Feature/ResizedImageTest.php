<?php

namespace Tests\Feature;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ResizedImageTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
        Storage::disk('public')->putFileAs('12', UploadedFile::fake()->image('tenger part.jpg', 1600, 900), 'tenger part.jpg');
    }

    public function test_an_image_is_served_as_a_smaller_webp_and_kept_on_disk(): void
    {
        $response = $this->get('/img/800/12/tenger%20part.jpg.webp')->assertOk();

        $this->assertSame('image/webp', $response->headers->get('Content-Type'));
        $this->assertTrue(Storage::disk('public')->exists('img/800/12/tenger part.jpg.webp'));
        $this->assertSame(800, getimagesize(Storage::disk('public')->path('img/800/12/tenger part.jpg.webp'))[0]);
    }

    public function test_small_images_are_not_enlarged(): void
    {
        $this->get('/img/1920/12/tenger%20part.jpg.webp')->assertOk();

        $this->assertSame(1600, getimagesize(Storage::disk('public')->path('img/1920/12/tenger part.jpg.webp'))[0]);
    }

    public function test_only_offered_widths_and_existing_images_are_served(): void
    {
        $this->get('/img/801/12/tenger%20part.jpg.webp')->assertNotFound();
        $this->get('/img/800/12/hianyzo.jpg.webp')->assertNotFound();
        $this->get('/img/800/12/../../.env.webp')->assertNotFound();
        $this->get('/img/800/img/800/12/tenger%20part.jpg.webp')->assertNotFound();
        $this->get('/img/800/12/dokumentum.pdf.webp')->assertNotFound();
    }
}
