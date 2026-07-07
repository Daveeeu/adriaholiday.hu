<?php

namespace Tests\Feature;

use App\Models\Tour;
use App\Models\TourDeparturePlace;
use App\Models\TourReferenceOption;
use App\Services\Legacy\LegacyImportOutcome;
use App\Services\Legacy\LegacyTourImporter;
use App\Support\Legacy\LegacyOfferData;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Tests\TestCase;

class LegacyTourImporterIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    private const ONE_PIXEL_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake(config('media-library.disk_name'));
        Http::fake([
            '*' => Http::response(base64_decode(self::ONE_PIXEL_PNG_BASE64), 200, ['Content-Type' => 'image/png']),
        ]);
    }

    private function offerData(): LegacyOfferData
    {
        return new LegacyOfferData(
            sourceUrl: 'https://adriaholiday.hu/korutazasok/albania-makedoniaval-fuszerezve',
            seoName: 'albania-makedoniaval-fuszerezve',
            name: 'Albánia, a Balkán Riviérája',
            shortDescription: 'Belgrád-Shkoder-Berat-Tirana-Kruja-Durres-Skopje-Ohrid-Vlora',
            galleryImageUrls: [
                'https://adriaholiday.hu/uploads/gallery/16205/photo-1.jpg',
                'https://adriaholiday.hu/uploads/gallery/16205/photo-2.jpg',
            ],
            dates: [
                ['start_date' => '2026-09-25', 'end_date' => '2026-10-01', 'price' => 269600.0, 'transport_code' => 'bus', 'catering' => 'félpanzió', 'accommodation' => 'Hotel***'],
                ['start_date' => '2026-10-10', 'end_date' => '2026-10-16', 'price' => 279600.0, 'transport_code' => 'bus', 'catering' => 'félpanzió', 'accommodation' => 'Hotel***'],
            ],
            programDays: [
                ['day_number' => 1, 'title' => 'Belgrád', 'description' => 'Indulás a kora reggeli órákban.'],
                ['day_number' => 2, 'title' => 'Shkoder', 'description' => 'Érkezés Albániába.'],
            ],
            priceItems: [
                ['type' => 'included', 'text' => 'autóbuszközlekedés'],
                ['type' => 'excluded', 'text' => 'belépők'],
            ],
            tags: ['Albánia', 'utazás Belgrád'],
            categories: ['Tengerparti üdülések'],
            countrySlugs: ['albania'],
            travelModeCode: 'bus',
            catering: 'félpanzió',
            accommodation: 'Hotel***',
            departurePlaceNames: ['Miskolc', 'Budapest'],
            notesHtml: '<p>Útiokmány szükséges.</p>',
            discountsHtml: null,
            price: 269600.0,
        );
    }

    public function test_first_import_creates_the_tour_and_its_related_records(): void
    {
        $importer = app(LegacyTourImporter::class);

        $outcome = $importer->import($this->offerData(), updateExisting: false);

        $this->assertSame(LegacyImportOutcome::Created, $outcome);
        $this->assertSame(1, Tour::query()->count());

        $tour = Tour::query()->where('seo_name', 'albania-makedoniaval-fuszerezve')->firstOrFail();
        $this->assertCount(2, $tour->dates);
        $this->assertCount(2, $tour->programDays);
        $this->assertCount(2, $tour->galleryItems);
        $this->assertCount(2, $tour->priceItems);
        $this->assertCount(2, $tour->departurePlaces);
        $this->assertSame(2, Media::query()->count());
    }

    public function test_reimporting_without_update_existing_skips_and_never_duplicates(): void
    {
        $importer = app(LegacyTourImporter::class);
        $data = $this->offerData();

        $importer->import($data, updateExisting: false);
        $outcome = $importer->import($data, updateExisting: false);

        $this->assertSame(LegacyImportOutcome::Skipped, $outcome);
        $this->assertSame(1, Tour::query()->count());
        $this->assertSame(2, Media::query()->count());
    }

    public function test_reimporting_with_update_existing_refreshes_without_duplicating_child_records(): void
    {
        $importer = app(LegacyTourImporter::class);
        $data = $this->offerData();

        $importer->import($data, updateExisting: false);
        $outcome = $importer->import($data, updateExisting: true);

        $this->assertSame(LegacyImportOutcome::Updated, $outcome);
        $this->assertSame(1, Tour::query()->count());

        $tour = Tour::query()->where('seo_name', 'albania-makedoniaval-fuszerezve')->firstOrFail();
        $this->assertCount(2, $tour->dates);
        $this->assertCount(2, $tour->programDays);
        $this->assertCount(2, $tour->galleryItems);
        $this->assertCount(2, $tour->priceItems);
        $this->assertCount(2, $tour->departurePlaces);

        // Same source image URLs -> reused Media rows, not re-downloaded.
        $this->assertSame(2, Media::query()->count());
        $this->assertSame(1, TourDeparturePlace::query()->where('name', 'Miskolc')->count());
        $this->assertSame(1, TourReferenceOption::query()->where('type', 'country')->where('code', 'al')->count());
    }
}
