<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Tour;
use App\Models\TourDate;
use App\Models\TourDeparturePlace;
use App\Support\Tour\TourDateStatus;
use App\Support\Tour\TourExtraChargeRule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LegacyAdminExportImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_existing_tour_takes_over_the_legacy_admin_data(): void
    {
        $tour = Tour::factory()->create(['seo_name' => 'milano-teszt', 'couponable' => true, 'notes' => '<p>régi</p>']);
        $tour->programDays()->create(['day_number' => 1, 'title' => 'Régi nap', 'description' => 'x', 'sort_order' => 1, 'active' => true]);
        $tour->priceItems()->create(['type' => 'included', 'text' => 'régi tétel', 'sort_order' => 1, 'active' => true]);
        $date = TourDate::factory()->for($tour)->create(['start_date' => '2027-05-16', 'end_date' => '2027-05-19']);
        $booking = Booking::factory()->create(['tour_id' => $tour->id, 'tour_date_id' => $date->id]);
        $file = tempnam(sys_get_temp_dir(), 'export');
        file_put_contents($file, json_encode(['offers' => [[
            'form' => [
                'seo_name' => 'milano-teszt', 'name' => 'Milánó', 'name_sub_1' => 'tavak', 'cities_affected' => 'Como-Milánó',
                'program' => '<p>1. NAP COMO</p><p>Igény esetén választható:</p><p>a., Bellagio</p>', 'coupon_enabled' => '0',
            ],
            'dates' => [[
                'id' => '1',
                'fields' => [
                    'date_date_from' => '2027-05-16', 'date_date_to' => '2027-05-19',
                    'status' => ['value' => 'active', 'text' => 'aktív'], 'space_number_monitoring' => ['value' => '1', 'text' => 'Igen'], 'space_number' => '12',
                    'travel' => ['value' => '1', 'text' => 'Autóbusszal'], 'accommodation' => 'Hotel***', 'provision' => 'reggeli',
                    'price' => '199000', 'sale_price' => '0', 'comment' => '',
                    '__checked' => ['felszallas[212]' => 'Miskolc, Centrum Áruház mögötti parkoló(+0 Ft/fő)', 'felszallas[228]' => 'Budapest BOK csarnok(+4700 Ft/fő)'],
                ],
                'extras' => [['id' => '9', 'line' => '1 ágyas felár | 59800 | Ft/fő | Egyágyas |']],
            ]],
        ]]]));

        $this->artisan('adria:import-admin-export', ['file' => $file])->assertSuccessful();

        $tour->refresh();
        $this->assertStringContainsString('a., Bellagio', $tour->program);
        $this->assertSame(0, $tour->programDays()->count());
        $this->assertSame(0, $tour->priceItems()->count());
        $this->assertNull($tour->notes);
        $this->assertFalse($tour->couponable);
        $this->assertSame(['tavak', 'Como-Milánó', 'Hotel***', 'reggeli'], [$tour->subtitle, $tour->short_description, $tour->accommodation, $tour->catering]);

        $date->refresh();
        $this->assertSame($date->id, $booking->fresh()->tour_date_id);
        $this->assertSame(TourDateStatus::AVAILABLE, $date->status);
        $this->assertSame(12, (int) $date->price_box_available_seats);
        $this->assertEquals(199000, $date->price_box_price);
        $this->assertSame(TourExtraChargeRule::SOLO_TRAVELLER, $date->extras()->sole()->charge_rule);

        $budapest = TourDeparturePlace::query()->where('name', 'Budapest BOK csarnok')->firstOrFail();
        $this->assertEquals(4700, $tour->departurePlaces()->whereKey($budapest->id)->firstOrFail()->pivot->fee);
        $this->assertSame(2, $tour->departurePlaces()->count());
    }

    public function test_a_tour_missing_from_the_new_site_is_skipped(): void
    {
        $file = tempnam(sys_get_temp_dir(), 'export');
        file_put_contents($file, json_encode(['offers' => [['form' => ['seo_name' => 'nincs-ilyen'], 'dates' => []]]]));

        $this->artisan('adria:import-admin-export', ['file' => $file])->assertSuccessful()->expectsOutputToContain('[SKIPPED] nincs-ilyen');
    }
}
