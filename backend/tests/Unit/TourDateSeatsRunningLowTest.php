<?php

namespace Tests\Unit;

use App\Models\TourDate;
use Tests\TestCase;

class TourDateSeatsRunningLowTest extends TestCase
{
    public function test_seats_run_low_at_35_percent_of_the_capacity(): void
    {
        $this->assertTrue($this->date(capacity: 40, held: 26)->seatsRunningLow());
        $this->assertTrue($this->date(capacity: 40, held: 39)->seatsRunningLow());
        $this->assertFalse($this->date(capacity: 40, held: 25)->seatsRunningLow());
    }

    public function test_a_sold_out_or_unlimited_date_is_not_running_low(): void
    {
        $this->assertFalse($this->date(capacity: 40, held: 40)->seatsRunningLow());
        $this->assertFalse($this->date(capacity: null, held: 12)->seatsRunningLow());
    }

    private function date(?int $capacity, int $held): TourDate
    {
        $date = new TourDate(['capacity' => $capacity]);
        $date->setRawAttributes([...$date->getAttributes(), 'seats_held' => $held]);

        return $date;
    }
}
