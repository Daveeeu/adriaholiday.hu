<?php

namespace Tests\Feature;

use App\Models\Tour;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortfolioOfferPdfTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);
    }

    public function test_active_tour_pdf_downloads_with_current_data(): void
    {
        $response = $this->get('/api/portfolio/offers/albania-makedoniaval-fuszerezve/pdf');

        $response->assertOk();
        $response->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF-', $response->getContent());
    }

    public function test_pdf_returns_404_for_unknown_slug(): void
    {
        $response = $this->get('/api/portfolio/offers/nincs-ilyen-utazas/pdf');

        $response->assertNotFound();
    }

    public function test_pdf_returns_404_for_inactive_tour(): void
    {
        $tour = Tour::query()->where('seo_name', 'albania-makedoniaval-fuszerezve')->firstOrFail();
        $tour->update(['active' => false]);

        $response = $this->get('/api/portfolio/offers/albania-makedoniaval-fuszerezve/pdf');

        $response->assertNotFound();
    }
}
